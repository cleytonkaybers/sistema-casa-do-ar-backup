/**
 * pdfBanner.js
 * Utilitário compartilhado para adicionar o banner da empresa
 * em todos os documentos PDF (jsPDF e window.print).
 */

let _imgCache = { url: null, b64: null };
let _bannerUrlCache = null; // null = não buscado ainda, '' = buscado e vazio

/** Limpa o cache (chamar após trocar o banner em Configurações) */
export function clearBannerCache() {
  _imgCache = { url: null, b64: null };
  _bannerUrlCache = null;
}

/**
 * Converte uma URL de imagem para base64 via canvas.
 * Não usa fetch — carrega como HTMLImageElement para evitar problemas de CORS.
 */
async function urlToBase64(url) {
  if (_imgCache.url === url && _imgCache.b64) return _imgCache.b64;

  const b64 = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // necessário para canvas não ficar "tainted"
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Falha ao carregar imagem: ' + url));
    img.src = url;
  });

  _imgCache = { url, b64 };
  return b64;
}

/**
 * Busca a URL do banner em PDFSettings.
 * Retorna null se não configurado.
 */
export async function getBannerUrl() {
  // _bannerUrlCache === null significa "ainda não buscou"
  // _bannerUrlCache === '' significa "buscou e não há banner"
  if (_bannerUrlCache !== null) return _bannerUrlCache || null;
  try {
    const { base44 } = await import('@/api/base44Client');
    const result = await base44.entities.PDFSettings.list();
    _bannerUrlCache = result?.[0]?.banner_url || '';
    return _bannerUrlCache || null;
  } catch {
    return null;
  }
}

/**
 * Adiciona o banner ao topo de um documento jsPDF.
 * @param {jsPDF} doc  - instância do jsPDF
 * @param {string|null} bannerUrl - URL da imagem do banner
 * @param {number} [heightMm=28]  - altura do banner em mm
 * @returns {number} coordenada Y onde o conteúdo deve começar
 */
export async function addBannerToDoc(doc, bannerUrl, heightMm = 28) {
  if (!bannerUrl) return 20;
  try {
    const b64 = await urlToBase64(bannerUrl);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.addImage(b64, 'JPEG', 0, 0, pageWidth, heightMm);
    return heightMm + 6;
  } catch (err) {
    console.warn('[pdfBanner] Não foi possível adicionar banner:', err?.message || err);
    return 20;
  }
}

/**
 * Retorna a tag <img> do banner para PDFs HTML (window.print).
 * Sem crossorigin — tags <img> não precisam de CORS para exibir.
 */
export function bannerHtmlImg(bannerUrl) {
  if (!bannerUrl) return '';
  return `<img
    src="${bannerUrl}"
    alt="Banner Casa do Ar"
    style="width:100%;max-height:90px;object-fit:cover;display:block;border-radius:6px;margin-bottom:18px"
  />`;
}
