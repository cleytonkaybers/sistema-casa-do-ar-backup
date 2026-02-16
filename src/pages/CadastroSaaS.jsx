import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CadastroSaaS() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    responsavel_nome: '',
    senha: '',
    confirma_senha: ''
  });

  const generateCompanyId = () => {
    return 'comp_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirma_senha) {
      toast.error('As senhas não conferem');
      return;
    }

    setLoading(true);
    try {
      const company_id = generateCompanyId();

      // Criar empresa
      const empresa = await base44.entities.EmpresaSaaS.create({
        company_id,
        nome: formData.nome,
        cnpj: formData.cnpj,
        email: formData.email,
        responsavel_nome: formData.responsavel_nome,
        status_assinatura: 'trial',
        data_inicio_trial: new Date().toISOString(),
        data_fim_trial: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        plano: 'basico'
      });

      // Atualizar usuário com company_id
      await base44.auth.updateMe({
        company_id,
        tipo_usuario: 'dono',
        empresa_id: empresa.id
      });

      // Criar registro de usuário na empresa
      await base44.entities.UsuarioEmpresa.create({
        company_id,
        email: formData.email,
        nome: formData.responsavel_nome,
        role: 'dono',
        data_aceite: new Date().toISOString()
      });

      toast.success('Empresa criada com sucesso! Teste por 7 dias grátis.');
      navigate(createPageUrl('DashboardSaaS'));
    } catch (error) {
      toast.error('Erro ao criar empresa: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-purple-900 border border-purple-700/50 rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">Criar Empresa</h1>
        <p className="text-purple-300 mb-8">Teste grátis por 7 dias, sem cartão de crédito</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Nome da Empresa
            </label>
            <Input
              type="text"
              placeholder="Ex: Climatização João"
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="bg-slate-700 border-purple-600 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              CNPJ
            </label>
            <Input
              type="text"
              placeholder="XX.XXX.XXX/0001-XX"
              value={formData.cnpj}
              onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
              className="bg-slate-700 border-purple-600 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Responsável
            </label>
            <Input
              type="text"
              placeholder="Seu nome completo"
              value={formData.responsavel_nome}
              onChange={(e) => setFormData({...formData, responsavel_nome: e.target.value})}
              className="bg-slate-700 border-purple-600 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Email
            </label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="bg-slate-700 border-purple-600 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Senha
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.senha}
              onChange={(e) => setFormData({...formData, senha: e.target.value})}
              className="bg-slate-700 border-purple-600 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Confirmar Senha
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.confirma_senha}
              onChange={(e) => setFormData({...formData, confirma_senha: e.target.value})}
              className="bg-slate-700 border-purple-600 text-white"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                Criar Empresa
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-center text-purple-300 text-sm">
            Já tem conta?{' '}
            <a href={createPageUrl('LoginSaaS')} className="text-cyan-400 hover:text-cyan-300">
              Entrar
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}