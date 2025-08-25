import React, { useState } from 'react';
import { UserForm } from '../components/UserForm';
import styles from './UserPage.module.css';

const UserPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem('user_id'));
  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('user_name'));

  const handleUserCreated = (id: string, name: string) => {
    setUserId(id);
    setUserName(name);
    localStorage.setItem('user_id', id);
    localStorage.setItem('user_name', name);
  };

  if (userId && userName) {
    return (
      <div className={styles.centered}>
        <h2>Welcome, {userName}!</h2>
        <p>
          Your user ID: <code>{userId}</code>
        </p>
        {/* Next: redirect or show next step */}
      </div>
    );
  }

  return (
    <div className={styles.centered}>
      <UserForm onUserCreated={handleUserCreated} />
    </div>
  );
};

export default UserPage;
