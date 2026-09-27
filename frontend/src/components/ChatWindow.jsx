import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import './ChatWindow.css';

export default function ChatWindow({ onSend, initialMessages = [] }) {
  const [messages, setMessages] = useState(
    initialMessages.length ? initialMessages : [
      { role: 'ai', text: 'Hello! I am your ChemAI assistant. Ask me why the algorithm chose certain conditions or what happens if we change a parameter.' }
    ]
  );
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const addMessage = (role, text) => {
    setMessages((prev) => [...prev, { role, text }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    addMessage('user', text);
    setInputValue('');
    
    if (onSend) {
      setIsTyping(true);
      try {
        const responseText = await onSend(text);
        if (responseText) {
          addMessage('ai', responseText);
        }
      } catch (err) {
        addMessage('ai', 'Error connecting to the AI core.');
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="chat-window glass-panel">
      <div className="chat-header">
        <h3>ChemAI Assistant</h3>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} role={msg.role} text={msg.text} />
        ))}
        
        {isTyping && (
          <div className="typing-indicator ai-row">
            <div className="ai-bubble message-bubble">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSend} className="chat-form">
          <textarea
            className="chat-textarea"
            placeholder="Type your question... (Press Enter to send)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          <button type="submit" className="chat-send-btn" disabled={!inputValue.trim() || isTyping}>
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
