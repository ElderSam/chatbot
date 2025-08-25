import React from 'react';
import styles from './HomePage.module.css';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import CreateChatComponent from './CreateChatPage';

const HomePage: React.FC = () => {
  const userName = localStorage.getItem('user_name');
  const userId = localStorage.getItem('user_id');
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate({ to: '/create-user' });
    }
  }, [userId, navigate]);

  return (
    <div className={styles.homeContainer}>
      <h1>Chatbot Home</h1>
      <p>
        {userName
          ? `Welcome, ${userName}!`
          : 'Welcome! Choose an option from the menu.'}
      </p>
      {userId && <CreateChatComponent />}
    </div>
  );
};

export default HomePage;
