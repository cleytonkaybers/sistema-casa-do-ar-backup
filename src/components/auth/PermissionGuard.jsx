import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export function usePermissions() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const isAdmin = user?.role === 'admin';
  
  const hasPermission = (permission) => {
    if (isAdmin) return true;
    if (!user?.permissoes) return false;
    return user.permissoes[permission] === true;
  };

  return { user, loading, isAdmin, hasPermission };
}

export function PermissionGuard({ permission, children, fallback = null }) {
  const { loading, hasPermission } = usePermissions();

  if (loading) {
    return <Loader2 className="w-4 h-4 animate-spin" />;
  }

  if (!hasPermission(permission)) {
    return fallback;
  }

  return children;
}