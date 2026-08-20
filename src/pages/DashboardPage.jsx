import { useAuth } from '../context/AuthContext.jsx'
import LibrarianDashboard from './librarian/LibrarianDashboard.jsx'
import MemberDashboard from './member/MemberDashboard.jsx'

// /dashboard is shared by both roles; render the matching dashboard.
export default function DashboardPage() {
  const { isLibrarian } = useAuth()
  return isLibrarian ? <LibrarianDashboard /> : <MemberDashboard />
}
