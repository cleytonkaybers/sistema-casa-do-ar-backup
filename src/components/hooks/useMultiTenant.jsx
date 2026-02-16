import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook para garantir acesso multi-tenant seguro
 * Sempre retorna o company_id do usuário autenticado
 * Validações automáticas de permissão
 */
export function useMultiTenant() {
  const [user, setUser] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        const currentUser = await base44.auth.me();
        
        if (!currentUser) {
          throw new Error('Usuário não autenticado');
        }

        if (!currentUser.company_id) {
          throw new Error('Usuário sem empresa associada');
        }

        setUser(currentUser);
        setCompanyId(currentUser.company_id);
      } catch (err) {
        setError(err.message);
        setUser(null);
        setCompanyId(null);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  /**
   * Validar que um recurso pertence à empresa do usuário
   */
  const validarOwnership = (recurso) => {
    if (!recurso || !companyId) return false;
    return recurso.company_id === companyId;
  };

  /**
   * Filtro automático para queries
   */
  const filtroAutomatico = (filtroCustomizado = {}) => {
    return {
      ...filtroCustomizado,
      company_id: companyId
    };
  };

  return {
    user,
    companyId,
    loading,
    error,
    validarOwnership,
    filtroAutomatico,
    autenticado: !!user && !!companyId
  };
}

/**
 * Hook para garantir acesso admin-only à empresa
 */
export function useAdminEmpresa() {
  const { user, companyId, loading } = useMultiTenant();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user && companyId) {
      const adminRoles = ['dono', 'admin'];
      setIsAdmin(adminRoles.includes(user.role));
    }
  }, [user, companyId]);

  return { isAdmin, user, companyId, loading };
}