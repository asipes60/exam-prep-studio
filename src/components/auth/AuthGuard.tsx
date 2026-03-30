import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function AuthGuard() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
