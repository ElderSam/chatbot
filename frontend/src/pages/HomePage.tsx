import React, { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import { useNavigate } from '@tanstack/react-router';
import MainLayout from '../components/MainLayout';

const HomePage: React.FC = () => {
  const userName = localStorage.getItem('user_name');
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      navigate({ to: '/create-user' });
    }
  }, [userId, navigate]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;
    setLoading(true);
    setError(null);
    try {
      // Cria novo chat
      const chatRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chats/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      if (!chatRes.ok) throw new Error('Erro ao criar conversa');
      const chatData = await chatRes.json();
      const conversation_id = chatData.conversation_id;
      // Envia primeira mensagem
      const msgRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, user_id: userId, conversation_id })
      });
      if (!msgRes.ok) throw new Error('Erro ao enviar mensagem');
      // Redireciona para o chat
      navigate({ to: `/chat/${conversation_id}` });
    } catch (err) {
      setError('Erro ao criar chat ou enviar mensagem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className={styles.layout}>
        <div className={styles.homeContainer}>
          <h1>Chatbot Home</h1>
          <p>
            {userName
              ? `Welcome, ${userName}!`
              : 'Welcome! Choose an option from the menu.'}
          </p>
          <form onSubmit={handleSend} className={styles.form}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your first message..."
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
    </MainLayout>
  );
};

export default HomePage;
