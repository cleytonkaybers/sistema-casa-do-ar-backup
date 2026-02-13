import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Users, 
  ClipboardList, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Snowflake,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { format, differenceInDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list('-created_date'),
  });

  const { data: atendimentos = [], isLoading: loadingAtendimentos } = useQuery({
    queryKey: ['atendimentos'],
    queryFn: () => base44.entities.Atendimento.list('-created_date'),
  });

  const isLoading = loadingClientes || loadingAtendimentos;

  // Estatísticas
  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter(c => c.status === 'Ativo').length;
  
  const manutencoesPendentes = clientes.filter(c => {
    if (!c.proxima_manutencao) return false;
    const daysUntil = differenceInDays(new Date(c.proxima_manutencao), new Date());
    return daysUntil <= 30;
  });

  const atendimentosDoMes = atendimentos.filter(a => {
    const dataAtendimento = new Date(a.data_atendimento);
    return isWithinInterval(dataAtendimento, {
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date())
    });
  });

  const atendimentosConcluidos = atendimentos.filter(a => a.status === 'Concluído').length;

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-2 text-gray-800">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral do sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Clientes')}>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
              <Users className="w-4 h-4 mr-2" />
              Ver Clientes
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total de Clientes"
          value={totalClientes}
          icon={Users}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          subtitle={`${clientesAtivos} ativos`}
        />
        <StatCard
          title="Atendimentos do Mês"
          value={atendimentosDoMes.length}
          icon={ClipboardList}
          color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          subtitle={format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
        />
        <StatCard
          title="Manutenções Pendentes"
          value={manutencoesPendentes.length}
          icon={AlertTriangle}
          color={manutencoesPendentes.length > 0 ? "bg-gradient-to-br from-amber-500 to-amber-600" : "bg-gradient-to-br from-green-500 to-green-600"}
          subtitle="Próximos 30 dias"
        />
        <StatCard
          title="Serviços Concluídos"
          value={atendimentosConcluidos}
          icon={CheckCircle2}
          color="bg-gradient-to-br from-green-500 to-green-600"
          subtitle="Total histórico"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manutenções Pendentes */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Manutenções Pendentes
            </CardTitle>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            {manutencoesPendentes.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-500">Nenhuma manutenção pendente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {manutencoesPendentes.slice(0, 5).map((cliente) => {
                  const daysUntil = differenceInDays(new Date(cliente.proxima_manutencao), new Date());
                  const isOverdue = daysUntil < 0;
                  
                  return (
                    <div
                      key={cliente.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isOverdue ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isOverdue ? 'bg-red-100' : 'bg-amber-100'
                        }`}>
                          <Snowflake className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-amber-600'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{cliente.nome}</p>
                          <p className="text-xs text-gray-500">{cliente.tipo_equipamento || 'Não especificado'}</p>
                        </div>
                      </div>
                      <div className={`text-right ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                        <p className="text-sm font-medium">
                          {isOverdue ? `${Math.abs(daysUntil)} dias atrasado` : `em ${daysUntil} dias`}
                        </p>
                        <p className="text-xs">
                          {format(new Date(cliente.proxima_manutencao), "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Últimos Clientes */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Últimos Clientes
            </CardTitle>
            <Link to={createPageUrl('Clientes')}>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {clientes.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">Nenhum cliente cadastrado</p>
                <Link to={createPageUrl('Clientes')}>
                  <Button variant="outline" className="mt-4">
                    Cadastrar primeiro cliente
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {clientes.slice(0, 5).map((cliente) => (
                  <div
                    key={cliente.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-semibold">
                        {cliente.nome?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{cliente.nome}</p>
                        <p className="text-xs text-gray-500">{cliente.cidade || 'Sem cidade'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {format(new Date(cliente.created_date), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}