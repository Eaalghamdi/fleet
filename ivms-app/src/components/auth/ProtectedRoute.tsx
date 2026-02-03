import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Role, Department } from '../../api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Role[];
  departments?: Department[];
}

export function ProtectedRoute({ children, roles, departments }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role restrictions
  if (roles && roles.length > 0 && user) {
    if (!roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check department restrictions
  if (departments && departments.length > 0 && user) {
    if (!departments.includes(user.department)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
