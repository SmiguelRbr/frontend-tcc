'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import api from '../services/api';
import ThemeToggle from '../components/ThemeToggle'; // 1. Importamos o componente criado!
import styles from './login.module.css';
// 2. Removemos o import do ThemeContext daqui, pois o Login não precisa mais dele diretamente.

export default function Login() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/login', formData);

            // DEBUG: Vê no F12 exatamente o que o Laravel mandou de volta!
            console.log('Login com sucesso, dados recebidos:', response.data);

            // 1. Guardar o Token
            if (response.data.token) {
                localStorage.setItem('@app-token', response.data.token);
            }

            // 2. Guardar o ID de forma segura (Tenta buscar dentro de user, ou direto na raiz)
            const userId = response.data.user?.id || response.data.id;
            if (userId) {
                localStorage.setItem('@user-id', userId);
            }
            
            // 3. Guardar a role de forma segura
            const roleName = response.data.user?.role?.name;
            if (roleName) {
                // Agora ele vai guardar "nutricionista" ou "paciente" em vez de [object Object]
                localStorage.setItem('@user-role', roleName); 
            }

            toast.success('Bem-vindo de volta!');

            // 4. O REDIRECIONAMENTO INTELIGENTE
            if (roleName === 'nutricionista' || roleName === 'personal') { 
                router.push('/profissional/dashboard');
            } else if (roleName === 'cliente' || roleName === 'paciente') { 
                router.push('/dashboard');
            } else {
                console.warn('Role não reconhecida no redirecionamento:', roleName);
                router.push('/dashboard');
            }

        } catch (error) {
            // DEBUG: Isto vai-nos dizer exatamente porque falhou!
            console.error('ERRO DETALHADO NO LOGIN:', error);

            if (error.response?.status === 422 && error.response.data.errors) {
                const validationErrors = error.response.data.errors;
                for (const field in validationErrors) {
                    validationErrors[field].forEach(errorMessage => {
                        toast.error(errorMessage);
                    });
                }
            }
            // ATENÇÃO: Adicionei o 401, que é o padrão do Laravel para credenciais erradas
            else if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error('E-mail ou senha incorretos.');
            }
            else {
                toast.error('Ocorreu um erro ao tentar fazer login.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.container}>

            {/* Botão de Tema renderizado através do nosso novo componente */}
            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                <ThemeToggle />
            </div>

            <div className={styles.card}>
                <header>
                    <h1 className={styles.title}>Acessar Conta</h1>
                    <p className={styles.subtitle}>Bem-vindo de volta!</p>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="email">E-mail</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            /* Trocado de inputProf para inputNeutral */
                            className={`${styles.input} ${styles.inputNeutral}`}
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            /* Trocado de inputProf para inputNeutral */
                            className={`${styles.input} ${styles.inputNeutral}`}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="********"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        /* Trocado de buttonProf para buttonNeutral */
                        className={`${styles.button} ${styles.buttonNeutral}`}
                    >
                        {loading ? 'A entrar...' : 'Entrar'}
                    </button>

                    <p className={styles.registerLink}>
                        Ainda não tem conta?{' '}
                        <a href="/cadastro">
                            Cadastre-se
                        </a>
                    </p>
                </form>
            </div>
        </main>
    );
}