import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">403 — Forbidden</h1>
        <p className="text-gray-600">You don't have access to this page.</p>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
