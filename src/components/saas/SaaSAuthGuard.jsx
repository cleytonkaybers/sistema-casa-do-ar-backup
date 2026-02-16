import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export function useSaaSAuth() {
  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSaaSAuth() {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (currentUser?.company_id) {
          const empresas = await base44.entities.EmpresaSaaS.filter({
            company_id: currentUser.company_id
          });
          
          if (empresas.length > 0) {
            setEmpresa(empresas[0]);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSaaSAuth();
  }, []);

  const isSubscriptionActive = () => {
    if (!empresa) return false;
    const status = empresa.status_assinatura;
    return status === 'ativa' || status === 'trial';
  };

  const daysRemainingTrial = () => {
    if (!empresa || empresa.status_assinatura !== 'trial') return 0;
    const now = new Date();
    const fim = new Date(empresa.data_fim_trial);
    const days = Math.ceil((fim - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  return { user, empresa, loading, error, isSubscriptionActive, daysRemainingTrial };
}

export function SaaSAuthGuard({ children, fallback = null }) {
  const { loading, isSubscriptionActive } = useSaaSAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isSubscriptionActive()) {
    return fallback || <SubscriptionExpiredPage />;
  }

  return children;
}

function SubscriptionExpiredPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Assinatura Expirada</h1>
        <p className="text-gray-600 mb-6">
          Sua assinatura venceu. Renove sua assinatura para continuar usando o sistema.
        </p>
        <button
          onClick={() => window.location.href = '/planos'}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Renovar Assinatura
        </button>
      </div>
    </div>
  );
}