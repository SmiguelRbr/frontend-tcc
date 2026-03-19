'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Verifica qual é o nome exato da chave que usaste no teu login!
        // Geralmente é algo como 'token', '@user-token', ou '@grovy-token'
        const token = localStorage.getItem('@app-token'); 

        if (!token) {
            // Se não tem token, rua!
            router.replace('/login');
        } else {
            // Se tem token, libera a renderização da página
            setIsAuthorized(true);
        }
    }, [router]);

    // Enquanto verifica, não mostra nada (evita o "piscar" da dashboard antes de ser expulso)
    if (!isAuthorized) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>Verificando credenciais...</div>;
    }

    return <>{children}</>;
}