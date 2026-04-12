import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function ResumoMesAdminDashboard({ servicosConcluidos, receita, despesas, comissoes }) {
  const lucroLiquido = receita - despesas - comissoes;

  const rows = [
    { label: 'Serviços concluídos', value: servicosConcluidos, valueClass: 'text-emerald-400', isNumber: true },
    { label: 'Receita',             value: formatCurrency(receita),    valueClass: 'text-emerald-400' },
    { label: 'Despesas',            value: formatCurrency(despesas),   valueClass: 'text-red-400' },
    { label: 'Comissões',           value: formatCurrency(comissoes),  valueClass: 'text-amber-500' },
  ];

  return (
    <Card className="bg-[#152236] border-white/5 shadow-sm hover:border-white/10 transition-all rounded-2xl flex-1 flex flex-col">
      <CardHeader className="pb-3 px-4 sm:px-5 pt-4 sm:pt-5 border-b border-white/5">
        <CardTitle className="text-sm font-bold text-gray-200 tracking-wide flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          Resumo do Mês
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 overflow-hidden divide-y divide-white/5">
        {rows.map(({ label, value, valueClass }) => (
          <div key={label} className="flex items-center justify-between px-4 sm:px-5 py-3 bg-white/5 hover:bg-white/10 transition-colors">
            <span className="text-xs sm:text-sm font-medium text-gray-400">{label}</span>
            <span className={`text-xs sm:text-sm font-bold ${valueClass}`}>{value}</span>
          </div>
        ))}

        {/* Lucro líquido em destaque */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#0d1826]/50">
          <span className="text-sm font-bold text-blue-400">Lucro Líquido</span>
          <span className={`text-sm sm:text-base font-bold px-2 sm:px-3 py-1 rounded-full ${
            lucroLiquido < 0
              ? 'text-red-400 bg-red-400/10'
              : 'text-blue-400 bg-blue-400/10'
          }`}>
            {lucroLiquido < 0 ? '-' : ''}{formatCurrency(Math.abs(lucroLiquido))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
