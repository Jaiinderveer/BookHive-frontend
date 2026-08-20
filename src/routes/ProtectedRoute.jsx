import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Blocks unauthenticated users. While the initial session is being validated
// (page refresh with a stored token), show a loading screen instead of a flash.
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Render nested routes via Outlet (React Router v6 requirement for nested routes)
  return <Outlet />
}
