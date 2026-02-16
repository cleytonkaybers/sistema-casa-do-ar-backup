import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Check, Wind, BarChart3, Users, Clock, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SaaSLanding() {
  const planos = [
    {
      nome: 'Básico',
      preco: 99,
      usuarios: 3,
      clientes: 50,
      recursos: ['Cadastro de clientes', 'Ordens de serviço', '1 usuário', 'Suporte por email']
    },
    {
      nome: 'Profissional',
      preco: 199,
      usuarios: 10,
      clientes: 500,
      recursos: ['Tudo do Básico', '5 usuários', 'Manutenção preventiva', 'Relatórios', 'Suporte prioritário'],
      destaque: true
    },
    {
      nome: 'Premium',
      preco: 399,
      usuarios: 'Ilimitado',
      clientes: 'Ilimitado',
      recursos: ['Tudo do Profissional', 'Usuários ilimitados', 'API integrada', 'Análises avançadas', 'Suporte 24/7']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-purple-700/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <Wind className="w-8 h-8 text-cyan-400" />
            <span>ClimaSaaS</span>
          </div>
          <div className="flex gap-4">
            <Link to={createPageUrl('LoginSaaS')}>
              <Button variant="outline" className="border-purple-400 text-purple-200 hover:bg-purple-700/20">
                Entrar
              </Button>
            </Link>
            <Link to={createPageUrl('CadastroSaaS')}>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Gestão Completa de Climatização
        </h1>
        <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
          Gerencie seus clientes, ordens de serviço e manutenção preventiva em um só lugar. Sem instalação, sem complicações.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to={createPageUrl('CadastroSaaS')}>
            <Button className="h-12 px-8 bg-gradient-to-r from-cyan-500 to-purple-600 text-lg">
              Teste Grátis por 7 dias
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Funcionalidades Principais</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-purple-900/40 to-transparent p-6 rounded-lg border border-purple-700/30">
            <Users className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Gestão de Clientes</h3>
            <p className="text-purple-200">Cadastre clientes com histórico de serviços e equipamentos</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-transparent p-6 rounded-lg border border-purple-700/30">
            <BarChart3 className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Ordens de Serviço</h3>
            <p className="text-purple-200">Crie, acompanhe e finalize ordens com rastreamento em tempo real</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-transparent p-6 rounded-lg border border-purple-700/30">
            <Clock className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Manutenção Preventiva</h3>
            <p className="text-purple-200">Alertas automáticos para manutenções periódicas</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-transparent p-6 rounded-lg border border-purple-700/30">
            <Lock className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Segurança Total</h3>
            <p className="text-purple-200">Dados isolados e criptografados por empresa</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-transparent p-6 rounded-lg border border-purple-700/30">
            <Zap className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Equipe Colaborativa</h3>
            <p className="text-purple-200">Convide técnicos e colaboradores da sua empresa</p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/40 to-transparent p-6 rounded-lg border border-purple-700/30">
            <BarChart3 className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Relatórios</h3>
            <p className="text-purple-200">Análises de faturamento e performance</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Planos e Preços</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {planos.map((plano) => (
            <div
              key={plano.nome}
              className={`rounded-lg p-8 border transition-all ${
                plano.destaque
                  ? 'bg-gradient-to-br from-cyan-600 to-purple-600 border-cyan-400 shadow-2xl shadow-cyan-500/50 scale-105'
                  : 'bg-gradient-to-br from-purple-900/40 to-transparent border-purple-700/30 hover:border-purple-600'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
              <div className="text-4xl font-bold mb-2">
                R$ {plano.preco}
                <span className="text-lg text-gray-300">/mês</span>
              </div>
              <p className="text-sm text-gray-300 mb-6">
                {plano.usuarios} usuário(s) • {plano.clientes} clientes
              </p>
              <ul className="space-y-3 mb-8">
                {plano.recursos.map((recurso) => (
                  <li key={recurso} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span>{recurso}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full h-10 bg-white text-purple-900 hover:bg-gray-100 font-bold">
                Escolher Plano
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-700/30 mt-20 py-10 text-center text-gray-400">
        <p>© 2026 ClimaSaaS. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}