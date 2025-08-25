import React, { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import styles from './ChatPage.module.css';
import Sidebar from '../components/Sidebar';

function formatWhatsappDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (isToday) {
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const ChatPage: React.FC = () => {
  const params = useParams({ from: '/chat/$conversation_id' });
  const conversation_id = params.conversation_id;
  const user_id = localStorage.getItem('user_id');
  const [messages, setMessages] = useState<Array<{ message: string; response: string; agent: string; timestamp: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversation history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user_id || !conversation_id) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat?user_id=${user_id}&conversation_id=${conversation_id}`);
        if (!res.ok) throw new Error('Error fetching history');
        const data = await res.json();
        setMessages(data.history || []);
      } catch (err) {
        setError('Error fetching history.');
      }
    };
    fetchHistory();
  }, [user_id, conversation_id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, user_id, conversation_id }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Error processing server response');
      }
      if (!res.ok) {
        if (data && data.message) {
          setError(Array.isArray(data.message) ? data.message.join(' ') : data.message);
        } else {
          setError('Error sending message.');
        }
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          message: input,
          response: data.response,
          agent: data.agent_workflow?.[1]?.agent || '',
          timestamp: new Date().toISOString(),
        },
      ]);
      setInput('');
    } catch (err) {
      setError('Error sending message.');
    } finally {
      setLoading(false);
    }
  };

  function renderBotResponse(response: string) {
    // Regex para encontrar links (http/https)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = response.split(urlRegex);
    return parts.map((part, idx) => {
      if (urlRegex.test(part)) {
        return (
          <a key={idx} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        );
      }
      return part;
    });
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className={styles.container}>
        <h2 className={styles.header}>Chat</h2>
        <div className={styles.messages}>
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div className={styles.userRow}>
                  <div className={styles.userMessage}>
                    <strong>You:</strong> {msg.message}
                    <div className={styles.timestamp}>{formatWhatsappDate(msg.timestamp)}</div>
                  </div>
                </div>
                <div className={styles.botRow}>
                  <div className={
                    `${styles.botMessage} ` +
                    (msg.agent === 'KnowledgeAgent'
                      ? styles.agentKnowledge
                      : msg.agent === 'MathAgent'
                      ? styles.agentMath
                      : styles.agentOther)
                  }>
                    <strong>Bot:</strong> {renderBotResponse(msg.response)}
                    <div className={styles.timestamp}>
                      Agent: {msg.agent} | {formatWhatsappDate(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSend} className={styles.form}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className={styles.input}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className={styles.button}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default ChatPage;
