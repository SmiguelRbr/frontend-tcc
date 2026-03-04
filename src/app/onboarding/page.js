'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import api from '../services/api';
import styles from './onboarding.module.css';

export default function OnboardingPage() {
  const router = useRouter();
  
  // Estado para guardar a role vinda do cadastro (cliente, nutricionista, personal)
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estados dos formulários consolidados
  const [formData, setFormData] = useState({
    nascimento: '',
    genero: '',
    altura: '',
    peso: '',
    objetivo: 'Hipertrofia e definição', // Default do cliente
    registroProfissional: '', // CRN/CREF
    bio: ''
  });

  // Busca a role no localStorage assim que a página carrega
  useEffect(() => {
    const roleSaved = localStorage.getItem('@app-temp-role');
    if (roleSaved) {
      setUserRole(roleSaved);
    } else {
      // Se não tiver role (entrou pelo URL direto sem cadastrar), manda pro cadastro
      toast.error('Sessão inválida. Por favor, cadastre-se primeiro.');
      router.push('/cadastro');
    }
  }, [router]);

  const isProfessional = userRole === 'nutricionista' || userRole === 'personal';
  const themeClass = isProfessional ? styles.inputProf : styles.inputAluno;
  const buttonClass = isProfessional ? styles.buttonProf : styles.buttonAluno;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userRole === 'cliente') {
        // --- PAYLOAD DO CLIENTE ---
        const payloadCliente = {
          nascimento: formData.nascimento,
          genero: formData.genero,
          altura: parseFloat(formData.altura), // Converte para número como a API pede
          peso: parseFloat(formData.peso),     // Converte para número
          objetivo: formData.objetivo
        };
        await api.post('/perfil/paciente', payloadCliente);
      
      } else {
        // --- PAYLOAD DO PROFISSIONAL ---
        const payloadProfissional = {
          "CRN/CREF": formData.registroProfissional, // Chave exata que a API pede
          bio: formData.bio
        };
        await api.post('/perfil/profissional', payloadProfissional);
      }

      toast.success('Perfil configurado com sucesso!');
      
      // Limpa a role temporária e envia para o login
      localStorage.removeItem('@app-temp-role');
      router.push('/login');

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Erro ao guardar o perfil.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Evita renderizar o formulário antes de saber qual é a role
  if (!userRole) return <div className={styles.container}>A carregar...</div>;

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <header>
          <h1 className={styles.title}>Complete o seu Perfil</h1>
          <p className={styles.subtitle}>
            {isProfessional 
              ? 'Falta pouco! Insira os seus dados profissionais.' 
              : 'Queremos conhecer-te melhor para personalizar a experiência.'}
          </p>
        </header>
        
        <form onSubmit={handleSubmit}>
          
          {/* --- ÁREA ESPECÍFICA: CLIENTE --- */}
          {!isProfessional && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Data de Nascimento</label>
                <input 
                  type="date" 
                  name="nascimento" 
                  className={`${styles.input} ${themeClass}`}
                  value={formData.nascimento}
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Gênero</label>
                <select 
                  name="genero" 
                  className={`${styles.select} ${themeClass}`}
                  value={formData.genero} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className={styles.row}>
                <div className={`${styles.formGroup} ${styles.col}`}>
                  <label className={styles.label}>Altura (m)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="1.75"
                    name="altura" 
                    className={`${styles.input} ${themeClass}`}
                    value={formData.altura}
                    onChange={handleChange} 
                    required
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.col}`}>
                  <label className={styles.label}>Peso (kg)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="80.5"
                    name="peso" 
                    className={`${styles.input} ${themeClass}`}
                    value={formData.peso}
                    onChange={handleChange} 
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Qual o seu objetivo principal?</label>
                <select 
                  name="objetivo"
                  className={`${styles.select} ${themeClass}`}
                  value={formData.objetivo}
                  onChange={handleChange}
                >
                  <option value="Hipertrofia e definição">Hipertrofia e definição</option>
                  <option value="Emagrecimento">Emagrecimento</option>
                  <option value="Saúde e Bem-estar">Saúde e Bem-estar</option>
                  <option value="Performance Esportiva">Performance Esportiva</option>
                </select>
              </div>
            </>
          )}

          {/* --- ÁREA ESPECÍFICA: PROFISSIONAL --- */}
          {isProfessional && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Número do {userRole === 'nutricionista' ? 'CRN' : 'CREF'}
                </label>
                <input 
                  type="text" 
                  name="registroProfissional" 
                  placeholder={userRole === 'nutricionista' ? 'Ex: CRN-3 12345' : 'Ex: 123456-G/SP'}
                  className={`${styles.input} ${themeClass}`}
                  value={formData.registroProfissional}
                  onChange={handleChange} 
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Biografia Curta</label>
                <textarea 
                  name="bio" 
                  placeholder="Especialista em nutrição esportiva e alto rendimento..."
                  className={`${styles.textarea} ${themeClass}`}
                  value={formData.bio}
                  onChange={handleChange} 
                  required
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            className={`${styles.button} ${buttonClass}`}
            disabled={loading}
          >
            {loading ? 'A guardar...' : 'Concluir Configuração'}
          </button>
        </form>
      </div>
    </main>
  );
}