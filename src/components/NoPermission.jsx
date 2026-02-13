import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function NoPermission() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <Lock className="w-8 h-8 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800">Acesso Negado</h1>
      <p className="text-gray-600 text-center max-w-md">
        Você não tem permissão para acessar esta página.
      </p>
      <Link to={createPageUrl('Dashboard')}>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Voltar ao Dashboard
        </Button>
      </Link>
    </div>
  );
}