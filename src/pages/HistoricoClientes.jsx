import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HistoricoClientes() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos'],
    queryFn: () => base44.entities.Servico.list('-data_programada'),
  });

  const { data: atendimentos = [] } = useQuery({
    queryKey: ['atendimentos'],
    queryFn: () => base44.entities.Atendimento.list('-data_atendimento'),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  // Combinar e ordenar histórico
  const historico = [
    ...servicos.map(s => ({
      id: `s-${s.id}`,
      tipo: 'Serviço',
      cliente: s.cliente_nome,
      descricao: s.tipo_servico,
      data: s.data_programada,
      status: s.status,
      valor: s.valor,
      usuario: s.usuario_atualizacao_status,
      data_atualizacao: s.data_atualizacao_status
    })),
    ...atendimentos.map(a => ({
      id: `a-${a.id}`,
      tipo: 'Atendimento',
      cliente: a.cliente_nome,
      descricao: a.tipo_servico,
      data: a.data_atendimento,
      status: a.status,
      valor: a.valor,
      usuario: a.usuario_atualizacao_status,
      data_atualizacao: a.data_atualizacao_status
    }))
  ].sort((a, b) => new Date(b.data_atualizacao || b.data) - new Date(a.data_atualizacao || a.data));

  const filteredHistorico = historico.filter(item =>
    item.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCores = {
    'aberto': 'bg-gray-100 text-gray-700',
    'andamento': 'bg-blue-100 text-blue-700',
    'concluido': 'bg-green-100 text-green-700',
    'pausado': 'bg-yellow-100 text-yellow-700',
    'Aberto': 'bg-gray-100 text-gray-700',
    'Em Andamento': 'bg-blue-100 text-blue-700',
    'Concluído': 'bg-green-100 text-green-700',
    'Pausado': 'bg-yellow-100 text-yellow-700'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Histórico de Clientes</h1>
        <p className="text-gray-500 mt-1">Acompanhe todos os serviços e atendimentos realizados</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar por cliente ou serviço..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 bg-white border-gray-200"
        />
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filteredHistorico.length === 0 ? (
          <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhum histórico encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredHistorico.map((item, index) => (
            <div key={item.id} className="flex gap-4">
              {/* Timeline marker */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.status === 'concluido' || item.status === 'Concluído'
                    ? 'bg-green-100'
                    : item.status === 'andamento' || item.status === 'Em Andamento'
                    ? 'bg-blue-100'
                    : 'bg-gray-100'
                }`}>
                  <TrendingUp className={`w-5 h-5 ${
                    item.status === 'concluido' || item.status === 'Concluído'
                      ? 'text-green-600'
                      : item.status === 'andamento' || item.status === 'Em Andamento'
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`} />
                </div>
                {index !== filteredHistorico.length - 1 && (
                  <div className="w-1 h-12 bg-gradient-to-b from-blue-200 to-transparent mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{item.cliente}</h3>
                          <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                            {item.tipo}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{item.descricao}</p>
                      </div>
                      <Badge className={`${statusCores[item.status]} border text-xs`}>
                        {item.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(item.data), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                        {item.valor && (
                          <span className="font-semibold text-green-600">
                            R$ {item.valor.toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                      {item.data_atualizacao && (
                        <span className="text-xs text-gray-400">
                          Atualizado: {format(new Date(item.data_atualizacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      )}
                    </div>

                    {item.usuario && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                        Por: {item.usuario}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}