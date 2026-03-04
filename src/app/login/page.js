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

            localStorage.setItem('@app-token', response.data.token);

            toast.success('Bem-vindo de volta!');
            console.log('Login realizado com sucesso:', response.data);

            // Lógica de sucesso (ex: salvar token no localStorage/cookies)

            router.push('/');

        } catch (error) {
            if (error.response?.status === 422 && error.response.data.errors) {
                const validationErrors = error.response.data.errors;
                for (const field in validationErrors) {
                    validationErrors[field].forEach(errorMessage => {
                        toast.error(errorMessage);
                    });
                }
            }
            else if (error.response?.status === 401) {
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