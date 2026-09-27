import React from 'react';
import ChatWindow from '../../components/ChatWindow';
import { useAppState } from '../../state/appState';
import { askAssistant } from '../../api/assistantApi';

export default function AssistantPage() {
  const { activeRunId } = useAppState();

  const handleSend = async (question) => {
    if (!activeRunId) {
      return "Please start an optimization run in the Optimizer tab before asking questions.";
    }

    try {
      const response = await askAssistant(activeRunId, question);
      return response.answer;
    } catch (err) {
      return `Error: ${err.message}`;
    }
  };

  return (
    <div className="page-content">
      <h1 className="page-title">AI Assistant</h1>
      <p className="page-subtitle">
        Ask questions about the optimization decisions or explore what-if scenarios.
      </p>

      {!activeRunId ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
          <div className="card-title">No Active Session</div>
          <p style={{ color: 'var(--text-muted)' }}>
            Start an optimization run in the Optimizer tab so I can explain the decisions!
          </p>
        </div>
      ) : (
        <ChatWindow onSend={handleSend} />
      )}
    </div>
  );
}
