import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export default function ProtectedRoute({ allowedRole }) {
  const { currentUser, token } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRole) {
    const roleKey = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
    const role = currentUser?.[roleKey] ?? currentUser?.role;
    if (role !== allowedRole) return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
