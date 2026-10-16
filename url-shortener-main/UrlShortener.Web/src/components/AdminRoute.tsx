import { Navigate } from 'react-router-dom';
import { getRole } from '../utils/auth.utils';

interface Props {
  children: React.ReactNode;
}

function AdminRoute({ children }: Props) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  if (getRole() !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

export default AdminRoute;
