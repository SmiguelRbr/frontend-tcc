import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function DashboardLayout({ children }) {
    return (
        <ProtectedRoute>
            {/* Tudo o que estiver dentro da pasta /dashboard vai exigir token agora! */}
            {children}
        </ProtectedRoute>
    );
}