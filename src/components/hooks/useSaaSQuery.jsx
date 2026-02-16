import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMultiTenant } from './useMultiTenant';
import { base44 } from '@/api/base44Client';

/**
 * Query Hook com suporte automático a multi-tenant
 * Sempre inclui company_id automaticamente
 */
export function useSaaSQuery(entityName, queryOptions = {}) {
  const { companyId, loading: tenantLoading } = useMultiTenant();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [entityName, companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const entity = base44.entities[entityName];
      if (!entity) throw new Error(`Entidade ${entityName} não encontrada`);
      
      // Filtro automático com company_id
      const results = await entity.filter({
        company_id: companyId,
        ...queryOptions.filter
      });
      
      return results;
    },
    enabled: !!companyId && queryOptions.enabled !== false,
    ...queryOptions
  });
}

/**
 * Mutation Hook para criar com company_id automático
 */
export function useSaaSCreate(entityName, onSuccess) {
  const { companyId } = useMultiTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados) => {
      if (!companyId) throw new Error('Empresa não identificada');
      
      const entity = base44.entities[entityName];
      return await entity.create({
        ...dados,
        company_id: companyId
      });
    },
    onSuccess: (data) => {
      // Invalidar query relacionada
      queryClient.invalidateQueries({
        queryKey: [entityName, companyId]
      });
      onSuccess?.(data);
    }
  });
}

/**
 * Mutation Hook para atualizar com validação ownership
 */
export function useSaaSUpdate(entityName, onSuccess) {
  const { companyId, validarOwnership } = useMultiTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dados, recursoOriginal }) => {
      if (!companyId) throw new Error('Empresa não identificada');
      
      // Validar que recurso pertence à empresa
      if (recursoOriginal && !validarOwnership(recursoOriginal)) {
        throw new Error('Sem permissão para atualizar este recurso');
      }
      
      const entity = base44.entities[entityName];
      return await entity.update(id, {
        ...dados,
        company_id: companyId  // Manter company_id original
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [entityName, companyId]
      });
      onSuccess?.(data);
    }
  });
}

/**
 * Mutation Hook para deletar com validação ownership
 */
export function useSaaSDelete(entityName, onSuccess) {
  const { companyId, validarOwnership } = useMultiTenant();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, recurso }) => {
      if (!companyId) throw new Error('Empresa não identificada');
      
      // Validar que recurso pertence à empresa
      if (!validarOwnership(recurso)) {
        throw new Error('Sem permissão para deletar este recurso');
      }
      
      const entity = base44.entities[entityName];
      return await entity.delete(id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [entityName, companyId]
      });
      onSuccess?.(data);
    }
  });
}