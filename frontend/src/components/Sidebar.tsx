import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import styles from './Sidebar.module.css';

interface Conversation {
  conversation_id: string;
  created_at?: string;
  // Add other fields if needed
}

const Sidebar: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user_id = localStorage.getItem('user_id');
  const navigate = useNavigate();
  let currentConversation = '';
  try {
    const params = useParams({ from: '/chat/$conversation_id' });
    currentConversation = params.conversation_id || '';
  } catch {
    currentConversation = '';
  }

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user_id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/chats?user_id=${user_id}`);
        if (!res.ok) throw new Error('Error fetching conversations');
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch (err) {
        setError('Error fetching conversations.');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user_id]);

  const handleNewChat = () => {
    navigate({ to: '/' });
  };

  return (
    <aside className={styles.sidebar}>
      <h3>Conversations</h3>
      <button className={styles.newChatBtn} onClick={handleNewChat}>
        + Novo Chat
      </button>
      {loading && <div>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}
      <ul className={styles.list}>
        {[...conversations].reverse().map((conv) => (
            <li
            key={conv.conversation_id}
            className={
              `${styles.item} ${(conv.conversation_id === currentConversation) ? styles.active : ''}`
            }
            onClick={() => navigate({ to: `/chat/${conv.conversation_id}` })}
            >
            {conv.conversation_id}
            </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
