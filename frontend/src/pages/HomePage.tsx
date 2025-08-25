import React from 'react';
import styles from './HomePage.module.css';
import { Link } from '@tanstack/react-router';

import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

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
          ? `Bem-vindo, ${userName}!`
          : 'Bem-vindo! Escolha uma opção no menu.'}
      </p>
    </div>
  );
};

export default HomePage;
