import React from 'react';
import ChatWindow from '../../components/ChatWindow';

export default function AssistantPage() {
  const handleSend = async (question) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`I understand you're asking about "${question}". As an AI assistant, I am currently in a mock state. In the upcoming updates, I will connect to the backend logic to provide actual insights based on your optimization run.`);
      }, 1200);
    });
  };

  return (
    <div className="page-content">
      <h1 className="page-title">AI Assistant</h1>
      <p className="page-subtitle">
        Ask questions about the optimization decisions or explore what-if scenarios.
      </p>
      <ChatWindow onSend={handleSend} />
    </div>
  );
}
