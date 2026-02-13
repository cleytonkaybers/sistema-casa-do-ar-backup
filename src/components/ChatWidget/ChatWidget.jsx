import React, { useState } from 'react';
import ChatBubble from './ChatBubble';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatBubble isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <ChatWindow isOpen={isOpen} />
    </>
  );
}