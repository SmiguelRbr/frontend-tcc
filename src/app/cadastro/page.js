'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation'; // 1. Importamos o useRouter
import { ThemeContext } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import styles from './cadastro.module.css';

export default function CadastroPage() {
  const router = useRouter(); // 2. Inicializamos o router
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'nutricionista'
  });

  const [loading, setLoading] = useState(false);

  const isProfessional = formData.role === 'nutricionista' || formData.role === 'personal';
  const themeClass = isProfessional ? styles.inputProf : styles.inputAluno;
  const buttonClass = isProfessional ? styles.buttonProf : styles.buttonAluno;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/register', formData);

      localStorage.setItem('@app-temp-role', formData.role)

      localStorage.setItem('@app-token', response.data.token);
      
      toast.success('Registo efetuado com sucesso! Faça o seu login.');
      console.log('Resposta Laravel:', response.data);
      
      // 3. Redireciona o utilizador para a página de login
      router.push('/onboarding');

    } catch (error) {
      if (error.response?.status === 422 && error.response.data.errors) {
        const validationErrors = error.response.data.errors;
        for (const field in validationErrors) {
          validationErrors[field].forEach(errorMessage => {
            toast.error(errorMessage);
          });
        }
      } else {
        const genericError = error.response?.data?.message || 'Erro ao processar o cadastro.';
        toast.error(genericError);
      }
      // O loading só passa a false se der erro, 
      // se der sucesso, deixamos true para o botão não piscar antes do redirect
      setLoading(false); 
    }
  };

  return (
    <div className={styles.container}>

      <div className={styles.card}>
        <header>
          <h1 className={styles.title}>Painel de Acesso</h1>
          <p className={styles.subtitle}>Preencha os dados para criar sua conta profissional</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Eu sou:</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              className={`${styles.input} ${styles.select} ${themeClass}`}
            >
              <option value="nutricionista">Nutricionista</option>
              <option value="personal">Personal Trainer</option>
              <option value="cliente">Cliente / Aluno</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Nome</label>
            <input
              type="text"
              name="name"
              placeholder="Seu nome completo"
              className={`${styles.input} ${themeClass}`}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>E-mail profissional</label>
            <input
              type="email"
              name="email"
              placeholder="exemplo@servico.com"
              className={`${styles.input} ${themeClass}`}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Palavra-passe</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className={`${styles.input} ${themeClass}`}
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirmar palavra-passe</label>
            <input
              type="password"
              name="password_confirmation"
              placeholder="••••••••"
              className={`${styles.input} ${themeClass}`}
              value={formData.password_confirmation}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`${styles.button} ${buttonClass}`}
            disabled={loading}
          >
            {loading ? 'A processar...' : 'Concluir Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}