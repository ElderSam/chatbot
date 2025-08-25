import React, { useState } from 'react';
import styles from './UserForm.module.css';

interface UserFormProps {
  onUserCreated: (userId: string, userName: string) => void;
}

export const UserForm: React.FC<UserFormProps> = ({ onUserCreated }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (userName.trim().length < 2 || userName.trim().length > 50) {
      setError('Name must be between 2 and 50 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: userName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Failed to create user.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      onUserCreated(data.user_id, userName.trim());
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <h2>Create User</h2>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Enter your name"
        minLength={2}
        maxLength={50}
        required
        className={styles.input}
      />
      <button type="submit" disabled={loading} className={styles.button}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </form>
  );
};
