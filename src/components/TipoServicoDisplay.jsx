import React from 'react';
import { groupTipoServico } from '@/utils';

/**
 * Exibe tipo_servico agrupando duplicatas com multiplicador.
 * Ex: "Limpeza 9k + Limpeza 9k + Instalação" → "2x Limpeza 9k" / "Instalação"
 */
export default function TipoServicoDisplay({ value, className = '' }) {
  const groups = groupTipoServico(value);
  if (!groups.length) return <span className="text-gray-500 text-sm">-</span>;

  return (
    <div className={`space-y-0.5 ${className}`}>
      {groups.map(({ name, count }) => (
        <div key={name} className="flex items-baseline gap-1.5 leading-snug">
          {count > 1 && (
            <span className="text-blue-400 font-bold text-xs tabular-nums shrink-0">{count}x</span>
          )}
          <span className="text-sm text-gray-300">{name}</span>
        </div>
      ))}
    </div>
  );
}
