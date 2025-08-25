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
    window.location.replace('/');
    return null;
  }

  return (
    <div className={styles.centered}>
      <UserForm onUserCreated={handleUserCreated} />
    </div>
  );
};

export default UserPage;
