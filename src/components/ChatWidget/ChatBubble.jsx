import React from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function ChatBubble({ isOpen, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white shadow-2xl shadow-purple-500/50 hover:shadow-2xl hover:scale-110 transition-all duration-300"
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <MessageCircle className="w-6 h-6" />
      )}
    </button>
  );
}