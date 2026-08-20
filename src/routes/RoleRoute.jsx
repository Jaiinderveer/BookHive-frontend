import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Restricts a route to a specific role. Users of the wrong role are shown the
// Unauthorized page (they are authenticated but not allowed). This is a UX guard;
// the backend remains the final authorization layer.
export default function RoleRoute({ role, children }) {
  const { isAuthenticated, role: userRole, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (userRole !== role) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
