import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIPOS_SERVICO = [
  'Instalação',
  'Manutenção Preventiva',
  'Manutenção Corretiva',
  'Limpeza',
  'Higienização',
  'Reparo',
  'Troca de Peça',
  'Orçamento',
  'Outro'
];

const STATUS_OPTIONS = ['Aberto', 'Em Andamento', 'Pausado', 'Concluído'];

export default function AtendimentoForm({ open, onClose, onSave, atendimento, cliente, isLoading }) {
  const [formData, setFormData] = useState({
    cliente_id: '',
    cliente_nome: '',
    data_atendimento: format(new Date(), 'yyyy-MM-dd'),
    tipo_servico: '',
    descricao: '',
    valor: '',
    status: 'Aberto',
    observacoes: ''
  });

  useEffect(() => {
    if (atendimento) {
      setFormData({
        cliente_id: atendimento.cliente_id || '',
        cliente_nome: atendimento.cliente_nome || '',
        data_atendimento: atendimento.data_atendimento || format(new Date(), 'yyyy-MM-dd'),
        tipo_servico: atendimento.tipo_servico || '',
        descricao: atendimento.descricao || '',
        valor: atendimento.valor || '',
        status: atendimento.status || 'Aberto',
        observacoes: atendimento.observacoes || ''
      });
    } else if (cliente) {
      setFormData({
        cliente_id: cliente.id || '',
        cliente_nome: cliente.nome || '',
        data_atendimento: format(new Date(), 'yyyy-MM-dd'),
        tipo_servico: '',
        descricao: '',
        valor: '',
        status: 'Aberto',
        observacoes: ''
      });
    }
  }, [atendimento, cliente, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      valor: formData.valor ? parseFloat(formData.valor) : null
    });
  };

  const formatCurrency = (value) => {
    const number = value.replace(/\D/g, '');
    const formatted = (parseInt(number || 0) / 100).toFixed(2);
    return formatted;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {atendimento ? 'Editar Atendimento' : 'Novo Atendimento'}
          </DialogTitle>
          {cliente && (
            <p className="text-sm text-gray-500 mt-1">
              Cliente: <span className="font-medium text-gray-700">{cliente.nome}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Data e Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data do Atendimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal",
                      !formData.data_atendimento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.data_atendimento ? (
                      format(new Date(formData.data_atendimento), "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      "Selecione"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.data_atendimento ? new Date(formData.data_atendimento) : undefined}
                    onSelect={(date) => setFormData({ ...formData, data_atendimento: date ? format(date, 'yyyy-MM-dd') : '' })}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Serviço *</Label>
              <Select
                value={formData.tipo_servico}
                onValueChange={(value) => setFormData({ ...formData, tipo_servico: value })}
                required
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SERVICO.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status e Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="0,00"
                className="h-11"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição do Serviço</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o serviço realizado..."
              rows={3}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.tipo_servico}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                atendimento ? 'Salvar Alterações' : 'Registrar Atendimento'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}