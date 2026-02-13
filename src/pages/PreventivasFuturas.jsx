import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, MapPin, Calendar, MessageCircle, Navigation, Search, Loader2, Clock, Wrench, Share2 } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format, differenceInDays, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PreventivasFuturasPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: clientes = [], isLoading: loadingClientes } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => base44.entities.Cliente.list('-created_date'),
  });

  const { data: servicos = [], isLoading: loadingServicos } = useQuery({
    queryKey: ['servicos'],
    queryFn: () => base44.entities.Servico.list('-created_date'),
  });

  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getWhatsAppLink = (phone) => {
    const cleaned = phone?.replace(/\D/g, '') || '';
    return `https://wa.me/55${cleaned}`;
  };

  const getGoogleMapsLink = (item) => {
    if (item.latitude && item.longitude) {
      return `https://www.google.com/maps?q=${item.latitude},${item.longitude}`;
    }
    if (item.endereco) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.endereco)}`;
    }
    return null;
  };

  const getManutencaoStatus = (proximaManutencao) => {
    if (!proximaManutencao) return null;
    const daysUntil = differenceInDays(new Date(proximaManutencao), new Date());
    
    if (daysUntil < 0) {
      return { 
        label: `Atrasada (${Math.abs(daysUntil)} dias)`, 
        color: 'bg-red-100 text-red-700 border-red-300',
        priority: 1
      };
    }
    if (daysUntil <= 30) {
      return { 
        label: `${daysUntil} dias`, 
        color: 'bg-amber-100 text-amber-700 border-amber-300',
        priority: 2
      };
    }
    if (daysUntil <= 90) {
      return { 
        label: `${daysUntil} dias`, 
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        priority: 3
      };
    }
    return { 
      label: `${daysUntil} dias`, 
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      priority: 4
    };
  };

  // Preparar dados de clientes com manutenção programada
  const clientesComManutencao = clientes
    .map(cliente => {
      // Se não tem próxima manutenção mas tem última, calcula 6 meses
      let proximaManutencao = cliente.proxima_manutencao;
      if (!proximaManutencao && cliente.ultima_manutencao) {
        const dataUltima = new Date(cliente.ultima_manutencao);
        proximaManutencao = format(addMonths(dataUltima, 6), 'yyyy-MM-dd');
      }
      
      return {
        ...cliente,
        tipo: 'cliente',
        proximaManutencao,
        status: getManutencaoStatus(proximaManutencao)
      };
    })
    .filter(c => c.proximaManutencao && c.status);

  // Preparar dados de serviços
  const servicosAtivos = servicos
    .filter(s => s.ativo !== false)
    .map(servico => ({
      ...servico,
      tipo: 'servico',
      status: { 
        label: 'Serviço Ativo', 
        color: 'bg-green-100 text-green-700 border-green-300',
        priority: 3
      }
    }));

  // Combinar e filtrar
  const todosItens = [...clientesComManutencao, ...servicosAtivos]
    .filter(item => {
      const matchNome = item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTelefone = item.telefone?.includes(searchTerm);
      return matchNome || matchTelefone;
    })
    .sort((a, b) => (a.status?.priority || 99) - (b.status?.priority || 99));

  const isLoading = loadingClientes || loadingServicos;

  const handleShare = async (item) => {
    const isCliente = item.tipo === 'cliente';
    const nome = isCliente ? item.nome : item.cliente_nome;
    const mapsLink = getGoogleMapsLink(item);
    
    let shareText = `📋 *${nome}*\n\n📞 ${formatPhone(item.telefone)}\n`;
    
    if (item.endereco) {
      shareText += `📍 ${item.endereco}\n`;
    }
    
    if (mapsLink) {
      shareText += `🗺️ ${mapsLink}\n`;
    }
    
    if (isCliente && item.proximaManutencao) {
      shareText += `\n📅 Próxima manutenção: ${format(new Date(item.proximaManutencao), "dd/MM/yyyy", { locale: ptBR })}\n`;
    }
    
    if (!isCliente) {
      shareText += `\n🔧 ${item.tipo_servico}`;
      if (item.dia_semana) shareText += `\n📆 ${item.dia_semana}`;
      if (item.horario) shareText += ` às ${item.horario}`;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: nome,
          text: shareText
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(shareText);
          toast.success('Informações copiadas!');
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Informações copiadas!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Preventivas Futuras</h1>
          <p className="text-gray-500 mt-1">Manutenções programadas e serviços ativos</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : todosItens.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">
            {searchTerm 
              ? 'Nenhum resultado encontrado'
              : 'Nenhuma manutenção programada ou serviço ativo'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-500 to-cyan-500">
                  <TableHead className="text-white font-semibold">Tipo</TableHead>
                  <TableHead className="text-white font-semibold">Nome</TableHead>
                  <TableHead className="text-white font-semibold">Telefone</TableHead>
                  <TableHead className="text-white font-semibold">Endereço</TableHead>
                  <TableHead className="text-white font-semibold">Serviço/Data</TableHead>
                  <TableHead className="text-white font-semibold">Status</TableHead>
                  <TableHead className="text-white font-semibold text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todosItens.map((item) => {
                  const isCliente = item.tipo === 'cliente';
                  const mapsLink = getGoogleMapsLink(item);

                  return (
                    <TableRow key={`${item.tipo}-${item.id}`} className="hover:bg-gray-50">
                      <TableCell>
                        <Badge className={isCliente ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                          {isCliente ? 'Cliente' : 'Serviço'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {isCliente ? item.nome : item.cliente_nome}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {formatPhone(item.telefone)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {item.endereco ? (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm line-clamp-2">{item.endereco}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isCliente && item.proximaManutencao ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {format(new Date(item.proximaManutencao), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        ) : !isCliente ? (
                          <div className="text-sm space-y-1">
                            <div className="font-medium text-gray-700">{item.tipo_servico}</div>
                            {item.dia_semana && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {item.dia_semana}
                                {item.horario && ` - ${item.horario}`}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={item.status.color}>
                          {item.status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(item)}
                            className="text-gray-600 hover:text-blue-600"
                            title="Compartilhar"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <a
                            href={getWhatsAppLink(item.telefone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-8 px-3 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          {mapsLink && (
                            <a
                              href={mapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
                              title="Google Maps"
                            >
                              <Navigation className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}