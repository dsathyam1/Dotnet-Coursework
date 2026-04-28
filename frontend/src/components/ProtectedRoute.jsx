import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ROLE → default dashboard path mapping.
 * Adjust these claim values to match what your .NET backend puts in the JWT.
 */
const ROLE_HOME = {
  Admin: '/admin/dashboard',
  Staff: '/staff/dashboard',
  Customer: '/customer/dashboard',
};

/**
 * ProtectedRoute
 *
 * Props:
 *  allowedRole  – string, e.g. "Admin" | "Staff" | "Customer"
 *
 * Behaviour:
 *  • Not authenticated  → redirect to /login
 *  • Wrong role         → redirect to that role's own dashboard
 *  • Correct role       → render child routes via <Outlet />
 */
export default function ProtectedRoute({ allowedRole }) {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // The .NET JWT stores role in "role" or the long ClaimTypes.Role URI
  const userRole =
    currentUser?.role ??
    currentUser?.[
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
    ];

  if (allowedRole && userRole !== allowedRole) {
    const home = ROLE_HOME[userRole] ?? '/login';
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
