import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, TrendingUp, Calendar, DollarSign, AlertCircle } from 'lucide-react';

const segmentacaoCores = {
  'VIP': 'bg-amber-100 text-amber-800 border-amber-300',
  'Regular': 'bg-blue-100 text-blue-800 border-blue-300',
  'Potencial': 'bg-green-100 text-green-800 border-green-300'
};

const segmentacaoDescricao = {
  'VIP': 'Cliente Premium',
  'Regular': 'Cliente Regular',
  'Potencial': 'Cliente em Potencial'
};

export default function ClientHealthSummary({ cliente, ultimoServico, proximaManutencao, totalGasto }) {
  const diasAteProxima = proximaManutencao
    ? Math.ceil((new Date(proximaManutencao) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const isAtrasada = diasAteProxima !== null && diasAteProxima < 0;
  const isProxima = diasAteProxima !== null && diasAteProxima >= 0 && diasAteProxima <= 7;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Segmentação */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-700/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-300">Segmentação</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <Badge className={`${segmentacaoCores[cliente.segmentacao]} border text-sm py-1 px-3`}>
            {segmentacaoDescricao[cliente.segmentacao]}
          </Badge>
        </CardContent>
      </Card>

      {/* Última Atividade */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-700/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-300">Última Atividade</CardTitle>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
        </CardHeader>
        <CardContent>
          {ultimoServico ? (
            <div>
              <p className="text-lg font-semibold text-cyan-400">
                {format(new Date(ultimoServico), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {Math.floor((new Date() - new Date(ultimoServico)) / (1000 * 60 * 60 * 24))} dias atrás
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Sem atividades</p>
          )}
        </CardContent>
      </Card>

      {/* Total Gasto */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-700/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-300">Total Gasto</CardTitle>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-400">
            R$ {(totalGasto || 0).toLocaleString('pt-BR')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {cliente.quantidade_servicos || 0} serviços realizados
          </p>
        </CardContent>
      </Card>

      {/* Próxima Manutenção */}
      <Card className={`bg-gradient-to-br ${
        isAtrasada 
          ? 'from-red-900 to-red-950 border-red-700/30' 
          : isProxima 
          ? 'from-yellow-900 to-yellow-950 border-yellow-700/30'
          : 'from-slate-800 to-slate-900 border-purple-700/30'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-300">Próxima Manutenção</CardTitle>
            {isAtrasada && <AlertCircle className="w-4 h-4 text-red-400" />}
            {isProxima && !isAtrasada && <AlertCircle className="w-4 h-4 text-yellow-400" />}
            {!isAtrasada && !isProxima && <Calendar className="w-4 h-4 text-blue-400" />}
          </div>
        </CardHeader>
        <CardContent>
          {proximaManutencao ? (
            <div>
              <p className={`text-lg font-semibold ${
                isAtrasada ? 'text-red-400' : isProxima ? 'text-yellow-400' : 'text-blue-400'
              }`}>
                {format(new Date(proximaManutencao), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
              <p className={`text-xs mt-1 ${
                isAtrasada ? 'text-red-300' : isProxima ? 'text-yellow-300' : 'text-gray-400'
              }`}>
                {isAtrasada 
                  ? `${Math.abs(diasAteProxima)} dias atrasada`
                  : isProxima
                  ? `Em ${diasAteProxima} dias`
                  : `Em ${diasAteProxima} dias`
                }
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Não agendada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}