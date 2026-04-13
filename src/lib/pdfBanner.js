/**
 * pdfBanner.js
 * Utilitário compartilhado para adicionar o banner da empresa
 * em todos os documentos PDF (jsPDF e window.print).
 */

let _cache = { url: null, b64: null };

/** Converte uma URL de imagem para base64 (com cache em memória) */
async function urlToBase64(url) {
  if (_cache.url === url && _cache.b64) return _cache.b64;
  const res = await fetch(url, { mode: 'cors' });
  const blob = await res.blob();
  const b64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  _cache = { url, b64 };
  return b64;
}

/** Detecta o formato da imagem a partir da URL ou do base64 */
function detectFormat(urlOrB64) {
  const s = (urlOrB64 || '').toLowerCase();
  if (s.includes('png')) return 'PNG';
  if (s.includes('gif')) return 'GIF';
  return 'JPEG';
}

/**
 * Busca a URL do banner nas CompanySettings.
 * Retorna null se não configurado.
 */
export async function getBannerUrl() {
  try {
    const { base44 } = await import('@/api/base44Client');
    const result = await base44.entities.CompanySettings.list();
    return result?.[0]?.company_banner_url || null;
  } catch {
    return null;
  }
}

/**
 * Adiciona o banner ao topo de um documento jsPDF.
 * @param {jsPDF} doc - instância do jsPDF
 * @param {string|null} bannerUrl - URL da imagem do banner
 * @param {number} [heightMm=28] - altura do banner em mm
 * @returns {number} coordenada Y de onde o conteúdo deve começar
 */
export async function addBannerToDoc(doc, bannerUrl, heightMm = 28) {
  if (!bannerUrl) return 20;
  try {
    const b64 = await urlToBase64(bannerUrl);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.addImage(b64, detectFormat(bannerUrl), 0, 0, pageWidth, heightMm);
    return heightMm + 6; // margem após o banner
  } catch {
    return 20;
  }
}

/**
 * Retorna a tag <img> do banner para uso em PDFs HTML (window.print).
 */
export function bannerHtmlImg(bannerUrl) {
  if (!bannerUrl) return '';
  return `<img
    src="${bannerUrl}"
    alt="Banner Casa do Ar"
    crossorigin="anonymous"
    style="width:100%;max-height:90px;object-fit:cover;display:block;border-radius:6px;margin-bottom:18px"
  />`;
}
