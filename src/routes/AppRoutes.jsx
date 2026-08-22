import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useAuth } from '../context/AuthContext.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import RoleRoute from './RoleRoute.jsx'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import Login from '../pages/Login.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'

const Unauthorized = lazy(() => import('../pages/Unauthorized.jsx'))
const NotFound = lazy(() => import('../pages/NotFound.jsx'))
const BooksPage = lazy(() => import('../pages/BooksPage.jsx'))
const Members = lazy(() => import('../pages/librarian/Members.jsx'))
const IssueBook = lazy(() => import('../pages/librarian/IssueBook.jsx'))
const ReturnBook = lazy(() => import('../pages/librarian/ReturnBook.jsx'))
const Transactions = lazy(() => import('../pages/librarian/Transactions.jsx'))
const AIAssistant = lazy(() => import('../pages/librarian/AIAssistant.jsx'))
const MyBooks = lazy(() => import('../pages/member/MyBooks.jsx'))
const Profile = lazy(() => import('../pages/member/Profile.jsx'))

function RootRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}

function PageFallback() {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.75,
      }}
    >
      <CircularProgress size={26} thickness={4.5} />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Loading…
      </Typography>
    </Box>
  )
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<RootRedirect />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/my-books" element={<RoleRoute role="member"><MyBooks /></RoleRoute>} />
            <Route path="/members" element={<RoleRoute role="librarian"><Members /></RoleRoute>} />
            <Route path="/issue" element={<RoleRoute role="librarian"><IssueBook /></RoleRoute>} />
            <Route path="/return" element={<RoleRoute role="librarian"><ReturnBook /></RoleRoute>} />
            <Route path="/transactions" element={<RoleRoute role="librarian"><Transactions /></RoleRoute>} />
            <Route path="/ai" element={<RoleRoute role="librarian"><AIAssistant /></RoleRoute>} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
