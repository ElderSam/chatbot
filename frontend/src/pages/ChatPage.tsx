import React, { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';

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
        if (!res.ok) throw new Error('Erro ao buscar histórico');
        const data = await res.json();
        setMessages(data.history || []);
      } catch (err) {
        setError('Erro ao buscar histórico.');
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
        throw new Error('Erro ao processar resposta do servidor');
      }
      if (!res.ok) {
        if (data && data.message) {
          setError(Array.isArray(data.message) ? data.message.join(' ') : data.message);
        } else {
          setError('Erro ao enviar mensagem.');
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
      setError('Erro ao enviar mensagem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem', border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Chat</h2>
      <div style={{ minHeight: 200, marginBottom: 16 }}>
        {messages.length === 0 ? (
          <p>Nenhuma mensagem ainda.</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              <div><strong>Você:</strong> {msg.message}</div>
              <div><strong>Bot:</strong> {msg.response}</div>
              <div style={{ fontSize: '0.8em', color: '#888' }}>Agente: {msg.agent} | {new Date(msg.timestamp).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          style={{ flex: 1, padding: 8 }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
    </div>
  );
};

export default ChatPage;
