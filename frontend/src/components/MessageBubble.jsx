import React from 'react';
import './MessageBubble.css';

export default function MessageBubble({ role, text }) {
  const isUser = role === 'user';
  
  return (
    <div className={`message-row ${isUser ? 'user-row' : 'ai-row'}`}>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
        {!isUser && <div className="message-sender">ChemAI</div>}
        {isUser && <div className="message-sender">You</div>}
        <div className="message-text">{text}</div>
      </div>
    </div>
  );
}
