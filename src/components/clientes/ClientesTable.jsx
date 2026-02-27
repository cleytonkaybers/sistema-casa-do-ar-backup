import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  MapPin, 
  Phone,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Eye,
  Star
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function ClientesTable({ 
  clientes, 
  onEdit, 
  onDelete, 
  onViewHistory,
  isAdmin 
}) {
  const navigate = useNavigate();
  const formatPhone = (phone) => {
    if (!phone) return '-';
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (cliente) => {
    const dataUltima = cliente.ultima_manutencao ? new Date(cliente.ultima_manutencao) : null;
    const dataProxima = cliente.proxima_manutencao ? new Date(cliente.proxima_manutencao) : null;
    const hoje = new Date();

    if (!dataProxima) return 'bg-gray-100 text-gray-700';
    if (dataProxima < hoje) return 'bg-red-100 text-red-700';
    if (dataProxima < new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000)) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="rounded-2xl border border-blue-800/40 shadow-lg overflow-hidden" style={{backgroundColor: '#243447'}}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-blue-800/40" style={{backgroundColor: 'rgba(30,64,175,0.3)'}}>
              <TableHead className="h-12 text-blue-200 font-bold">Nome</TableHead>
              <TableHead className="h-12 text-blue-200 font-bold">Telefone</TableHead>
              <TableHead className="h-12 text-blue-200 font-bold">Endereço</TableHead>
              <TableHead className="h-12 text-blue-200 font-bold">Última Manutenção</TableHead>
              <TableHead className="h-12 text-blue-200 font-bold">Próxima Manutenção</TableHead>
              <TableHead className="h-12 text-blue-200 font-bold">Segmentação</TableHead>
              <TableHead className="h-12 text-blue-200 font-bold">Status</TableHead>
              <TableHead className="h-12 text-right text-blue-200 font-bold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.map((cliente, index) => (
              <TableRow 
                key={cliente.id}
                className="border-blue-800/30 transition-colors hover:bg-blue-900/20"
              >
                <TableCell className="font-semibold text-white py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      {cliente.nome?.charAt(0).toUpperCase()}
                    </div>
                    {cliente.nome}
                  </div>
                </TableCell>
                <TableCell className="text-blue-200 py-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-400" />
                    {formatPhone(cliente.telefone)}
                  </div>
                </TableCell>
                <TableCell className="text-blue-200 py-4">
                  <div className="flex items-center gap-2 max-w-xs truncate">
                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="truncate">{cliente.endereco || '-'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-blue-200 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    {formatDate(cliente.ultima_manutencao)}
                  </div>
                </TableCell>
                <TableCell className="text-blue-200 py-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    {formatDate(cliente.proxima_manutencao)}
                  </div>
                </TableCell>
                <TableCell className="py-4">
                   <div className="flex items-center gap-1">
                     {cliente.segmentacao === 'VIP' && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
                     <Badge className={
                       cliente.segmentacao === 'VIP' ? 'bg-amber-900/60 text-amber-200 border-amber-700/50' :
                       cliente.segmentacao === 'Potencial' ? 'bg-green-900/60 text-green-200 border-green-700/50' :
                       'bg-blue-900/60 text-blue-200 border-blue-700/50'
                     }>
                       {cliente.segmentacao || 'Regular'}
                     </Badge>
                   </div>
                 </TableCell>
                 <TableCell className="py-4">
                   <Badge className={getStatusColor(cliente)}>
                     {!cliente.proxima_manutencao ? 'Sem agendamento' : 
                      new Date(cliente.proxima_manutencao) < new Date() ? 'Atrasada' :
                      new Date(cliente.proxima_manutencao) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'Próxima semana' :
                      'No prazo'}
                   </Badge>
                 </TableCell>
                 <TableCell className="py-4">
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-blue-300 hover:text-white hover:bg-blue-800/40"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem 
                          onClick={() => navigate(`${createPageUrl('ClienteDetalhes')}?id=${cliente.id}`)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-600">Ver Detalhes</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onViewHistory?.(cliente)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Clock className="w-4 h-4" />
                          Ver Histórico
                        </DropdownMenuItem>
                        {onEdit && (
                          <DropdownMenuItem 
                            onClick={() => onEdit(cliente)}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-600">Editar</span>
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(cliente)}
                            className="flex items-center gap-2 cursor-pointer text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Deletar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}