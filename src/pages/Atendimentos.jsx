import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { usePermissions } from '@/components/auth/PermissionGuard';
import TipoServicoDisplay from '@/components/TipoServicoDisplay';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import { 
  Search, 
  ClipboardList, 
  Filter,
  Loader2,
  Calendar,
  Wrench,
  DollarSign,
  Trash2,
  X,
  Info,
  Share2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import DeleteConfirmDialog from '@/components/clientes/DeleteConfirmDialog';
import DetalhesModal from '@/components/atendimentos/DetalhesModal';
import CompartilharModal from '@/components/servicos/CompartilharModal';

const formatDate = (date) => {
  if (!date) return '-';
  try { return format(new Date(date), "dd/MM/yyyy", { locale: ptBR }); }
  catch { return '-'; }
};

export default function Atendimentos() {
  const queryClient = useQueryClient();
  const { user: currentUser, loading: loadingUser, isAdmin } = usePermissions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAtendimento, setDeletingAtendimento] = useState(null);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [selectedAtendimento, setSelectedAtendimento] = useState(null);
  const [compartilharOpen, setCompartilharOpen] = useState(false);
  const [atendimentoCompartilhar, setAtendimentoCompartilhar] = useState(null);

  const { data: atendimentos = [], isLoading } = useQuery({
    queryKey: ['atendimentos'],
    queryFn: () => base44.entities.Atendimento.list('-data_atendimento'),
  });

  const { data: usuarios = [], isLoading: isLoadingUsuarios } = useQuery({
    queryKey: ['usuarios-atendimentos'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: servicos = [] } = useQuery({
    queryKey: ['servicos-atendimentos'],
    queryFn: () => base44.entities.Servico.list(),
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-atendimentos'],
    queryFn: () => base44.entities.Cliente.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Atendimento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atendimentos'] });
      setDeleteDialogOpen(false);
      setDeletingAtendimento(null);
      toast.success('Atendimento excluído com sucesso!');
    },
    onError: () => toast.error('Erro ao excluir atendimento'),
  });

  const tiposServico = useMemo(() => {
    const tiposSet = new Set(atendimentos.map(a => a.tipo_servico).filter(Boolean));
    return Array.from(tiposSet).sort();
  }, [atendimentos]);

  const equipeIdUsuario = currentUser?.equipe_id || null;

  const filteredAtendimentos = useMemo(() => {
    if (loadingUser) return [];

    const filtered = atendimentos.filter(atendimento => {
      if (!isAdmin) {
        if (equipeIdUsuario) {
          if (atendimento.equipe_id !== equipeIdUsuario) return false;
        } else {
          if (atendimento.equipe_id) return false;
        }
      }

      const matchesSearch = 
        atendimento.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atendimento.tipo_servico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atendimento.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTipo = filterTipo === 'all' || atendimento.tipo_servico === filterTipo;
      
      return matchesSearch && matchesTipo;
    });

    return filtered.sort((a, b) => {
      const dataA = new Date(a.data_conclusao || a.data_atendimento);
      const dataB = new Date(b.data_conclusao || b.data_atendimento);
      return dataB - dataA;
    });
  }, [atendimentos, searchTerm, filterTipo, isAdmin, equipeIdUsuario, loadingUser]);

  const handleDelete = (atendimento) => {
    setDeletingAtendimento(atendimento);
    setDeleteDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterTipo('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || filterTipo !== 'all';

  const totalPages = Math.ceil(filteredAtendimentos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAtendimentos = filteredAtendimentos.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTipo]);

  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleVerDetalhes = (atendimento) => {
    setSelectedAtendimento(atendimento);
    setDetalhesOpen(true);
  };

  const handleCompartilhar = (atendimento) => {
    let telefone = atendimento.telefone;
    if (!telefone && atendimento.detalhes) {
      try {
        const det = typeof atendimento.detalhes === 'string' ? JSON.parse(atendimento.detalhes) : atendimento.detalhes;
        telefone = det?.dados_ordem_servico?.telefone || '';
      } catch {}
    }
    if (!telefone && atendimento.servico_id) {
      const servicoOrigem = servicos.find(s => s.id === atendimento.servico_id);
      telefone = servicoOrigem?.telefone || '';
    }
    if (!telefone && atendimento.cliente_nome) {
      const clienteMatch = clientes.find(c => 
        c.nome?.trim().toLowerCase() === atendimento.cliente_nome?.trim().toLowerCase()
      );
      telefone = clienteMatch?.telefone || '';
    }

    let det = null;
    if (atendimento.detalhes) {
      try { det = typeof atendimento.detalhes === 'string' ? JSON.parse(atendimento.detalhes) : atendimento.detalhes; } catch {}
    }
    const servicoOrigem = atendimento.servico_id ? servicos.find(s => s.id === atendimento.servico_id) : null;

    const get = (field) =>
      atendimento[field] ||
      det?.dados_ordem_servico?.[field] ||
      servicoOrigem?.[field] ||
      '';

    setAtendimentoCompartilhar({
      cliente_nome: atendimento.cliente_nome,
      telefone: telefone || '',
      tipo_servico: atendimento.tipo_servico,
      data_programada: atendimento.data_atendimento || get('data_programada'),
      horario: get('horario'),
      endereco: get('endereco'),
      valor: atendimento.valor || get('valor'),
      descricao: get('descricao'),
      observacoes_conclusao: get('observacoes_conclusao'),
      equipe_nome: get('equipe_nome'),
      status: 'concluido',
    });
    setCompartilharOpen(true);
  };



  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 tracking-tight">Atendimentos</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2 text-sm">
            Total Histórico: <span className="font-semibold text-gray-300">{atendimentos.length} concluídos</span>
          </p>
        </div>
      </div>

      {/* Toolbar / Filtros Modernos */}
      <div className="bg-[#152236] border border-white/5 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar por cliente ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-[#0d1826] border-white/10 text-gray-200 placeholder:text-gray-500 w-full h-11 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="w-full md:w-[220px] bg-[#0d1826] border-white/10 text-gray-200 h-11 rounded-xl">
              <SelectValue placeholder="Tipo de Serviço" />
            </SelectTrigger>
            <SelectContent className="bg-[#152236] border-white/10 text-gray-200">
              <SelectItem value="all" className="hover:bg-white/5">Todos os tipos</SelectItem>
              {tiposServico.map(tipo => (
                <SelectItem key={tipo} value={tipo} className="hover:bg-white/5">{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-gray-400 hover:text-white hover:bg-white/5 px-3 h-11 shrink-0"
              title="Limpar Filtros"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest w-full sm:w-auto text-center sm:text-left">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAtendimentos.length)} de {filteredAtendimentos.length}
            </p>
            <div className="flex items-center justify-center gap-2 w-full sm:w-auto pb-4 sm:pb-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-[#152236] border-white/10 text-gray-300 hover:bg-white/5"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-gray-400 mx-2">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-[#152236] border-white/10 text-gray-300 hover:bg-white/5"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {paginatedAtendimentos.length === 0 ? (
            <div className="text-center py-20 bg-[#152236] border border-white/5 rounded-2xl flex flex-col items-center">
              <div className="w-20 h-20 bg-[#0d1826] border border-white/5 rounded-full flex items-center justify-center mb-5">
                <ClipboardList className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-200 mb-2">
                {hasActiveFilters ? 'Nenhum atendimento encontrado' : 'Nenhum atendimento registrado'}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'Tente ajustar os filtros de busca para encontrar o que procura.'
                  : 'Os atendimentos aparecem aqui automaticamente após a conclusão dos serviços.'}
              </p>
            </div>
      ) : (
        <>
          {/* Desktop Table (Visible on lg e superiores) */}
          <Card className="hidden lg:block border border-white/5 bg-[#152236] shadow-sm rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-[#0b1420] border-b border-white/5">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-gray-400 font-semibold h-12">Cliente</TableHead>
                  <TableHead className="text-gray-400 font-semibold h-12 w-44">Data Conclusão</TableHead>
                  <TableHead className="text-gray-400 font-semibold h-12 w-64">Tipo de Serviço</TableHead>
                  {isAdmin && <TableHead className="text-gray-400 font-semibold h-12 w-32">Valor</TableHead>}
                  <TableHead className="text-gray-400 font-semibold h-12 w-48">Concluído por</TableHead>
                  <TableHead className="text-right text-gray-400 font-semibold h-12 w-36">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-white/5">
                {paginatedAtendimentos.map((atendimento) => (
                  <TableRow key={atendimento.id} className="hover:bg-white/5 border-none transition-colors group">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-bold shadow-inner">
                          {atendimento.cliente_nome?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-200 truncate">{atendimento.cliente_nome || '-'}</p>
                          {atendimento.telefone && <p className="text-[11px] text-gray-500 mt-0.5">{atendimento.telefone}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-300 bg-[#0d1826] border border-white/5 px-3 py-1.5 rounded-lg w-max shadow-sm">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">{formatDate(atendimento.data_conclusao || atendimento.data_atendimento)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2 text-gray-300">
                        <Wrench className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <TipoServicoDisplay value={atendimento.tipo_servico} />
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <span className="font-semibold text-emerald-400">
                          {formatCurrency(atendimento.valor)}
                        </span>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="text-xs text-gray-300 space-y-1">
                        {(() => {
                          const equipe = atendimento.equipe_nome || 
                            servicos.find(s => s.id === atendimento.servico_id)?.equipe_nome || '';
                          return equipe ? <p className="font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md inline-block border border-blue-500/10">👷 {equipe}</p> : null;
                        })()}
                        <p className="text-gray-500 mt-1">{atendimento.usuario_conclusao || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => handleCompartilhar(atendimento)} className="h-8 w-8 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10" title="Compartilhar">
                           <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleVerDetalhes(atendimento)} className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" title="Ver Detalhes">
                           <Info className="w-4 h-4" />
                         </Button>
                         {isAdmin && (
                           <Button variant="ghost" size="icon" onClick={() => handleDelete(atendimento)} className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10" title="Excluir">
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile Cards View (Otimizado, flexível flex box) */}
          <div className="lg:hidden flex flex-col gap-4">
            {paginatedAtendimentos.map((atendimento) => (
              <Card key={atendimento.id} className="bg-[#152236] border border-white/5 shadow-md hover:border-white/10 transition-colors overflow-hidden rounded-2xl flex flex-col">
                <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                  {/* Card Header (Client info) */}
                  <div className="flex items-start justify-between mb-4 gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 font-bold shrink-0">
                        {atendimento.cliente_nome?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-100 text-[15px] truncate">{atendimento.cliente_nome || '-'}</p>
                        <TipoServicoDisplay value={atendimento.tipo_servico} className="mt-0.5" />
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] shrink-0 font-semibold">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Concluído
                    </Badge>
                  </div>
                  
                  {/* Detailed Info */}
                  <div className="bg-[#0b1420] border border-white/5 rounded-xl p-3 mb-4 space-y-2.5">
                     <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-xs text-gray-300">
                           <Calendar className="w-3.5 h-3.5 text-blue-400" />
                           <span>{formatDate(atendimento.data_conclusao || atendimento.data_atendimento)}</span>
                         </div>
                         {isAdmin && <span className="font-bold text-emerald-400 text-sm">{formatCurrency(atendimento.valor)}</span>}
                     </div>
                     {atendimento.usuario_conclusao && (
                        <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-1.5 border-t border-white/5">
                           <span>Concluído por:</span>
                           <span className="font-medium text-gray-300 truncate">{atendimento.usuario_conclusao}</span>
                        </div>
                     )}
                  </div>
                  
                  {atendimento.observacoes_conclusao && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-widest">Observações</p>
                      <p className="text-sm text-gray-300 italic line-clamp-2">"{atendimento.observacoes_conclusao}"</p>
                    </div>
                  )}

                  {/* Actions Grid (Otimizado pro toque na tela) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-auto pt-3 border-t border-white/5">
                    <Button variant="outline" className="w-full bg-[#0d1826] border-white/10 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 h-10 text-gray-300 flex" onClick={() => handleCompartilhar(atendimento)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        <span className="text-xs font-semibold">Compartilhar</span>
                    </Button>
                    <Button variant="outline" className="w-full bg-[#0d1826] border-white/10 hover:bg-white/10 hover:text-white h-10 text-gray-300 flex" onClick={() => handleVerDetalhes(atendimento)}>
                        <Info className="w-4 h-4 mr-2" />
                        <span className="text-xs font-semibold">Detalhes</span>
                    </Button>
                    {isAdmin && (
                        <Button variant="outline" className="md:col-start-4 w-full bg-red-500/5 border-red-500/20 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-red-500 h-10 flex" onClick={() => handleDelete(atendimento)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          <span className="text-xs font-semibold">Excluir</span>
                        </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </>
        )}
      </>
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeletingAtendimento(null); }}
        onConfirm={() => deleteMutation.mutate(deletingAtendimento?.id)}
        clienteName={`atendimento de ${deletingAtendimento?.cliente_nome}`}
        isLoading={deleteMutation.isPending}
      />

      <DetalhesModal
        open={detalhesOpen}
        onClose={() => { setDetalhesOpen(false); setSelectedAtendimento(null); }}
        atendimento={selectedAtendimento}
      />

      <CompartilharModal
        open={compartilharOpen}
        onClose={() => { setCompartilharOpen(false); setAtendimentoCompartilhar(null); }}
        servico={atendimentoCompartilhar}
        isConclusao={true}
      />
    </div>
  );
}