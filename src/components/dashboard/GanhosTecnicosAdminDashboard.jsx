import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

export default function GanhosTecnicosAdminDashboard({ tecnicos }) {
  const sortedTecnicos = [...tecnicos].sort((a, b) => b.credito_pendente - a.credito_pendente);

  return (
    <Card className="bg-[#152236] border-white/5 shadow-sm hover:border-white/10 transition-all rounded-2xl flex-1 flex flex-col">
      <CardHeader className="pb-3 px-4 sm:px-5 pt-4 sm:pt-5 border-b border-white/5 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-gray-200 tracking-wide flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          Desempenho da Semana dos Técnicos
        </CardTitle>
        <Link to="/FinanceiroAdmin" className="text-xs text-blue-400 hover:text-blue-300 font-medium shrink-0">
          Ver Completo
        </Link>
      </CardHeader>

      <CardContent className="p-0 overflow-y-auto max-h-[340px] sm:max-h-[300px]">
        {sortedTecnicos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Nenhum dado financeiro esta semana</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sortedTecnicos.map((tec) => (
              <div key={tec.id || tec.tecnico_id} className="px-4 sm:px-5 py-3 hover:bg-white/5 transition-colors">

                {/* Nome + equipe */}
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-200 truncate">{tec.tecnico_nome}</p>
                    <p className="text-[11px] text-gray-500 truncate">{tec.equipe_nome || 'Sem equipe'}</p>
                  </div>
                  {/* Pendente em destaque no mobile (visível ao lado do nome) */}
                  <Badge
                    variant="outline"
                    className={`ml-3 shrink-0 text-xs font-bold ${
                      tec.credito_pendente > 0
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}
                  >
                    {formatCurrency(tec.credito_pendente)}
                  </Badge>
                </div>

                {/* Valores em linha horizontal */}
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-gray-600">Bruto</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-300">{formatCurrency(tec.total_ganho)}</span>
                  </div>
                  <div className="w-px h-6 bg-white/10 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-gray-600">Pago</span>
                    <span className="text-xs sm:text-sm font-semibold text-blue-400">{formatCurrency(tec.credito_pago)}</span>
                  </div>
                  <div className="w-px h-6 bg-white/10 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-gray-600">Pendente</span>
                    <span className={`text-xs sm:text-sm font-bold ${tec.credito_pendente > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                      {formatCurrency(tec.credito_pendente)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
