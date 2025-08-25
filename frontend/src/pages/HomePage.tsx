import React from 'react';
import styles from './HomePage.module.css';
import { Link } from '@tanstack/react-router';

const HomePage: React.FC = () => {
  const userName = localStorage.getItem('user_name');
  const userId = localStorage.getItem('user_id');
  return (
    <div className={styles.homeContainer}>
      <h1>Chatbot Home</h1>
      <p>
        {userName
          ? `Bem-vindo, ${userName}!`
          : 'Bem-vindo! Escolha uma opção no menu.'}
      </p>
      {!userId && <Link to="/create-user">Criar Usuário</Link>}
    </div>
  );
};

export default HomePage;
