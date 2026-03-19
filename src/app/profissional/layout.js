import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function ProfissionalLayout({ children }) {
    return (
        <ProtectedRoute>
            {/* Tudo o que estiver dentro da pasta /profissional vai exigir token! */}
            {children}
        </ProtectedRoute>
    );
}