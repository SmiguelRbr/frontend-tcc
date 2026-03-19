'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import styles from './error.module.css';

export default function NaoAutorizado() {
    const router = useRouter();

    const handleGoBack = () => {
        // Redireciona com base na role guardada, ou manda para a raiz
        const role = typeof window !== 'undefined' ? localStorage.getItem('@user-role') : null;
        if (role === 'cliente' || role === 'paciente') router.push('/dashboard');
        else if (role === 'nutricionista' || role === 'personal') router.push('/profissional/dashboard');
        else router.push('/');
    };

    return (
        <div className={styles.wrapper}>
            <motion.div 
                className={styles.container}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <ShieldAlert size={60} color="#ef4444" />
                </div>
                <h1 className={styles.errorCode}>401</h1>
                <h2 className={styles.title}>Acesso Restrito</h2>
                <p className={styles.message}>
                    Oops! Parece que não tens permissões para aceder a esta área do Grovy. 
                    Se achas que isto é um erro, verifica se estás na conta correta.
                </p>
                <button className={styles.btn} onClick={handleGoBack}>
                    Voltar ao Meu Painel
                </button>
            </motion.div>
        </div>
    );
}