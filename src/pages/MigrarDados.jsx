import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MigrarDados() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);

  const executarMigracao = async () => {
    setLoading(true);
    setResultado(null);
    setErro(null);

    try {
      const response = await base44.functions.invoke('migrarTudoParaNovaEmpresa');
      
      if (response.data.success) {
        setResultado(response.data);
        toast.success('Migração realizada com sucesso!');
      } else {
        setErro(response.data.error || 'Erro desconhecido');
        toast.error('Erro na migração');
      }
    } catch (error) {
      setErro(error.message);
      toast.error('Erro ao executar migração: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Migrar Dados para Casa do Ar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Atenção!</p>
                <p>Isso vai transferir todos os seus clientes, serviços, atendimentos e preventivas para a conta casadoarclima@gmail.com como proprietária.</p>
              </div>
            </div>
          </div>

          <Button
            onClick={executarMigracao}
            disabled={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Migrando...
              </>
            ) : (
              'Executar Migração'
            )}
          </Button>

          {resultado && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-2">{resultado.message}</p>
                  <ul className="space-y-1">
                    <li>✓ Clientes: {resultado.resumo.clientesMigrados}</li>
                    <li>✓ Serviços: {resultado.resumo.servicosMigrados}</li>
                    <li>✓ Atendimentos: {resultado.resumo.atendimentosMigrados}</li>
                    <li>✓ Preventivas: {resultado.resumo.preventivasMigradas}</li>
                    <li>✓ Usuários: {resultado.resumo.usuariosMigrados}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-1">Erro</p>
                  <p>{erro}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}