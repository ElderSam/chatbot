import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

const CreateChatPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateChat = async () => {
    setLoading(true);
    setError(null);
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setError('Usuário não encontrado.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chats/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!response.ok) throw new Error('Erro ao criar chat');
      const data = await response.json();
      localStorage.setItem('conversation_id', data.conversation_id);
      navigate({ to: `/chat/${data.conversation_id}` });
    } catch (err) {
      setError('Erro ao criar chat.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Iniciar Nova Conversa</h2>
      <button onClick={handleCreateChat} disabled={loading}>
        {loading ? 'Criando...' : 'Iniciar Chat'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CreateChatPage;
