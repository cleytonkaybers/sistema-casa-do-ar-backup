import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function PreferencesNotificacaoPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const { data: preferences = null } = useQuery({
    queryKey: ['preferenciasNotificacao', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return null;
      const result = await base44.entities.PreferenciaNotificacao.filter(
        { usuario_email: currentUser.email }
      );
      return result.length > 0 ? result[0] : null;
    },
    enabled: !!currentUser?.email,
  });

  const [formData, setFormData] = useState({
    atendimento_criado: true,
    atendimento_atualizado: true,
    atendimento_concluido: true,
  });

  useEffect(() => {
    if (preferences) {
      setFormData({
        atendimento_criado: preferences.atendimento_criado ?? true,
        atendimento_atualizado: preferences.atendimento_atualizado ?? true,
        atendimento_concluido: preferences.atendimento_concluido ?? true,
      });
    }
  }, [preferences]);

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      if (preferences?.id) {
        return base44.entities.PreferenciaNotificacao.update(preferences.id, data);
      } else {
        return base44.entities.PreferenciaNotificacao.create({
          usuario_email: currentUser.email,
          ...data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferenciasNotificacao'] });
      toast.success('Preferências salvas com sucesso!');
    },
    onError: () => toast.error('Erro ao salvar preferências'),
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Preferências de Notificação</h1>
          <p className="text-gray-500 mt-1">Configure quais eventos devem notificá-lo</p>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Notificações de Atendimento</CardTitle>
          <CardDescription>Escolha quais eventos deseja receber notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <Label className="text-base font-semibold">Novo Atendimento</Label>
              <p className="text-sm text-gray-600 mt-1">Receber notificação quando um novo atendimento é criado</p>
            </div>
            <Switch
              checked={formData.atendimento_criado}
              onCheckedChange={(value) =>
                setFormData({ ...formData, atendimento_criado: value })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <Label className="text-base font-semibold">Atendimento Atualizado</Label>
              <p className="text-sm text-gray-600 mt-1">Receber notificação quando um atendimento é atualizado</p>
            </div>
            <Switch
              checked={formData.atendimento_atualizado}
              onCheckedChange={(value) =>
                setFormData({ ...formData, atendimento_atualizado: value })
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <Label className="text-base font-semibold">Atendimento Concluído</Label>
              <p className="text-sm text-gray-600 mt-1">Receber notificação quando um atendimento é concluído</p>
            </div>
            <Switch
              checked={formData.atendimento_concluido}
              onCheckedChange={(value) =>
                setFormData({ ...formData, atendimento_concluido: value })
              }
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 h-11 mt-6"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Preferências'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}