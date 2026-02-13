import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MessageBubble({ message, currentUserEmail }) {
  const isUser = message.sender_type === 'user';
  const isAI = message.sender_type === 'ai';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
            : isAI
            ? 'bg-purple-700/40 text-gray-100 border border-purple-600/50 rounded-bl-none'
            : 'bg-slate-700 text-gray-200 rounded-bl-none'
        }`}
      >
        {!isUser && (
          <p className="text-xs font-semibold text-purple-300 mb-1">{message.sender_name}</p>
        )}
        <p className="text-sm break-words">{message.content}</p>
        <p className="text-xs mt-1 opacity-60">
          {format(new Date(message.created_date), 'HH:mm', { locale: ptBR })}
        </p>
      </div>
    </div>
  );
}