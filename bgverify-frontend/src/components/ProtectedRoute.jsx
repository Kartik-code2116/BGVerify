import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading BGVerify...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    // Redirect to appropriate dashboard
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (['org_owner', 'hr_admin', 'hr_executive'].includes(user?.role))
      return <Navigate to="/company" replace />;
    return <Navigate to="/candidate" replace />;
  }

  return children;
}
