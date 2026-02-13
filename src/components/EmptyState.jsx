import React from 'react';
import { Button } from '@/components/ui/button';

export default function EmptyState({ 
  title = 'Nenhum dado encontrado',
  description = 'Comece adicionando um novo item',
  icon: Icon = null,
  action = null,
  actionLabel = 'Adicionar',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 text-center max-w-md">{description}</p>
      {action && (
        <Button onClick={action} className="bg-blue-600 hover:bg-blue-700">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}