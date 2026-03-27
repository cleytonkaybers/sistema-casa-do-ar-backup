import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import { MessageCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function CompromissoClientePDF({ isOpen, onClose, pagamento = null, servicos = [] }) {
  const [loading, setLoading] = useState(false);

  if (!pagamento) return null;

  const records = pagamento._records || [pagamento];
  const totalValor = records.reduce((s, r) => s + (r.valor_total || 0), 0);
  const totalPago = records.reduce((s, r) => s + (r.valor_pago || 0), 0);
  const saldoRestante = totalValor - totalPago;

  // Agrupar parcelas futuras
  const parcelasFuturas = records.flatMap(r => (r.historico_pagamentos || []).filter(h => h.agendada === true));

  const gerarPDF = () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = 20;

      // Cabeçalho com logo/marca
      doc.setFontSize(16);
      doc.setTextColor(30, 58, 138);
      doc.text('COMPROMISSO DE PAGAMENTO', margin, yPos);
      yPos += 8;

      doc.setDrawColor(30, 58, 138);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      // Dados do cliente
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Cliente: ${pagamento.cliente_nome}`, margin, yPos);
      yPos += 6;
      doc.text(`Telefone: ${pagamento.telefone || '—'}`, margin, yPos);
      yPos += 6;
      doc.text(`Data do Documento: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPos);
      yPos += 10;

      // Seção de serviços
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 138);
      doc.text('SERVIÇOS REALIZADOS', margin, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      records.forEach((r, idx) => {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = margin;
        }
        const dataFormatada = r.data_conclusao ? new Date(r.data_conclusao).toLocaleDateString('pt-BR') : '—';
        doc.text(`${idx + 1}. ${r.tipo_servico} — ${dataFormatada}`, margin + 2, yPos);
        yPos += 5;
        if (r.equipe_nome) {
          doc.setTextColor(100, 100, 100);
          doc.text(`    Equipe: ${r.equipe_nome}`, margin + 2, yPos);
          yPos += 4;
          doc.setTextColor(0, 0, 0);
        }
        doc.text(`    Valor: ${formatCurrency(r.valor_total || 0)}`, margin + 2, yPos);
        yPos += 6;
      });

      yPos += 4;

      // Resumo financeiro
      doc.setFontSize(12);
      doc.setTextColor(30, 58, 138);
      doc.text('RESUMO FINANCEIRO', margin, yPos);
      yPos += 7;

      doc.setFontSize(10);
      const resumoLinhas = [
        { label: 'Total de Serviços', valor: formatCurrency(totalValor) },
        { label: 'Total Pago', valor: formatCurrency(totalPago), destaque: true },
        { label: 'Saldo Pendente', valor: formatCurrency(Math.max(0, saldoRestante)), destaque: saldoRestante > 0.01 },
      ];

      resumoLinhas.forEach(linha => {
        doc.setTextColor(0, 0, 0);
        if (linha.destaque && saldoRestante > 0.01) {
          doc.setTextColor(200, 0, 0);
          doc.setFont(undefined, 'bold');
        } else if (linha.destaque) {
          doc.setFont(undefined, 'bold');
        }
        doc.text(`${linha.label}:`, margin, yPos);
        doc.text(linha.valor, pageWidth - margin - 5, yPos, { align: 'right' });
        doc.setFont(undefined, 'normal');
        yPos += 6;
      });

      yPos += 4;

      // Métodos de pagamento
      const obsCompleta = records.flatMap(r => (r.historico_pagamentos || []).map(h => h.observacao)).filter(Boolean);
      if (obsCompleta.length > 0) {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = margin;
        }
        doc.setFontSize(12);
        doc.setTextColor(30, 58, 138);
        doc.text('MÉTODOS E OBSERVAÇÕES', margin, yPos);
        yPos += 7;

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        obsCompleta.forEach(obs => {
          const wrapped = doc.splitTextToSize(`• ${obs}`, pageWidth - margin * 2 - 4);
          wrapped.forEach(line => {
            if (yPos > pageHeight - 40) {
              doc.addPage();
              yPos = margin;
            }
            doc.text(line, margin + 2, yPos);
            yPos += 5;
          });
        });
        yPos += 2;
      }

      // Parcelas futuras
      if (parcelasFuturas.length > 0) {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = margin;
        }
        doc.setFontSize(12);
        doc.setTextColor(30, 58, 138);
        doc.text('PARCELAS FUTURAS AGENDADAS', margin, yPos);
        yPos += 7;

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        parcelasFuturas.forEach((p, idx) => {
          if (yPos > pageHeight - 20) {
            doc.addPage();
            yPos = margin;
          }
          doc.text(`${idx + 1}. ${p.data} — ${formatCurrency(p.valor)}`, margin + 2, yPos);
          yPos += 5;
        });
      }

      // Rodapé
      yPos = pageHeight - 15;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Este é um documento formal de compromisso de pagamento. Favor conservar para controle pessoal.', pageWidth / 2, yPos, { align: 'center' });

      // Salvar PDF
      const nomeArquivo = `compromisso_pagamento_${pagamento.cliente_nome.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nomeArquivo);
      toast.success('📄 PDF gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const enviarWhatsApp = async () => {
    try {
      const telefone = pagamento.telefone?.replace(/\D/g, '');
      if (!telefone) return toast.error('Telefone não disponível');

      const mensagem = `Olá ${pagamento.cliente_nome}! 👋\n\nSegue o resumo do seu compromisso de pagamento:\n\n💰 *Total*: ${formatCurrency(totalValor)}\n✅ *Pago*: ${formatCurrency(totalPago)}\n⏳ *Pendente*: ${formatCurrency(Math.max(0, saldoRestante))}\n\nQualquer dúvida, estou à disposição!`;

      const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Erro ao abrir WhatsApp');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>📋 Compartilhar Compromisso de Pagamento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-800 mb-2">Cliente:</p>
            <p className="text-base font-bold text-blue-700">{pagamento.cliente_nome}</p>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p>Telefone: {pagamento.telefone || '—'}</p>
              <p className="font-semibold text-lg text-gray-800 mt-2">
                Saldo Pendente: <span className="text-red-600">{formatCurrency(Math.max(0, saldoRestante))}</span>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-2">
            <p className="font-semibold text-gray-800">📊 O relatório incluirá:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Todos os serviços realizados</li>
              <li>Valores totais e pagos</li>
              <li>Métodos de pagamento utilizados</li>
              <li>Observações do pagamento</li>
              {parcelasFuturas.length > 0 && <li>Parcelas futuras agendadas</li>}
            </ul>
          </div>
        </div>

        <DialogFooter className="flex gap-2 flex-col sm:flex-row">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={enviarWhatsApp} className="bg-green-600 hover:bg-green-700 text-white gap-2">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
          <Button onClick={gerarPDF} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Download className="w-4 h-4" />
            {loading ? 'Gerando...' : 'Baixar PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}