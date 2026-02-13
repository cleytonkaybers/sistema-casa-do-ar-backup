import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ICONES_DISPONIVEIS = [
  '🔧', '💨', '❄️', '⚙️', '🔩', '🧹', '🧊',
  '⚡', '🌡️', '📍', '💧', '🛠️', '🔨', '📋'
];

export default function ServiceTypeManager({ isOpen, onClose, onTypeAdded }) {
  const [novoTipo, setNovoTipo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [iconeSelected, setIconeSelected] = useState('🔧');
  const queryClient = useQueryClient();

  const createTypeMutation = useMutation({
    mutationFn: (data) => base44.entities.TipoServico.create(data),
    onSuccess: () => {
      toast.success('Tipo de serviço criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['tipos-servico'] });
      setNovoTipo('');
      setDescricao('');
      setIconeSelected('🔧');
      onTypeAdded?.();
    },
    onError: () => toast.error('Erro ao criar tipo de serviço')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!novoTipo.trim()) {
      toast.error('Digite um nome para o tipo de serviço');
      return;
    }

    createTypeMutation.mutate({
      nome: novoTipo,
      descricao,
      icone: iconeSelected,
      ativo: true
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Tipo de Serviço</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Nome do Tipo</Label>
            <Input
              placeholder="Ex: Limpeza de 9k"
              value={novoTipo}
              onChange={(e) => setNovoTipo(e.target.value)}
              disabled={createTypeMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              placeholder="Descrição do serviço"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              disabled={createTypeMutation.isPending}
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label>Selecione um Ícone</Label>
            <div className="grid grid-cols-7 gap-2">
              {ICONES_DISPONIVEIS.map(icone => (
                <button
                  key={icone}
                  type="button"
                  onClick={() => setIconeSelected(icone)}
                  className={`text-2xl p-2 rounded-lg transition-all ${
                    iconeSelected === icone
                      ? 'bg-cyan-500 scale-110'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {icone}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createTypeMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createTypeMutation.isPending}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              {createTypeMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando...</>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Tipo
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}