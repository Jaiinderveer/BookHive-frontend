import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'

// Single source of truth for the sidebar navigation per role.
// Routes mirror the backend API capabilities only.
// Returns structured navigation with optional section headers.
export function getNavigation(role) {
  if (role === 'librarian') {
    return [
      { section: 'DASHBOARD', items: [
        { label: 'Dashboard', path: '/dashboard', icon: DashboardOutlinedIcon },
      ]},
      { section: 'LIBRARY', items: [
        { label: 'Books', path: '/books', icon: MenuBookOutlinedIcon },
        { label: 'Members', path: '/members', icon: GroupOutlinedIcon },
      ]},
      { section: 'CIRCULATION', items: [
        { label: 'Issue Book', path: '/issue', icon: AddCircleOutlineIcon },
        { label: 'Return Book', path: '/return', icon: AssignmentReturnOutlinedIcon },
        { label: 'Transactions', path: '/transactions', icon: ReceiptLongOutlinedIcon },
      ]},
      { section: 'AI', items: [
        { label: 'AI Assistant', path: '/ai', icon: AutoAwesomeOutlinedIcon },
      ]},
    ]
  } else {
    return [
      { section: 'DASHBOARD', items: [
        { label: 'Dashboard', path: '/dashboard', icon: DashboardOutlinedIcon },
      ]},
      { section: 'LIBRARY', items: [
        { label: 'Browse Books', path: '/books', icon: MenuBookOutlinedIcon },
        { label: 'My Books', path: '/my-books', icon: LibraryBooksOutlinedIcon },
      ]},
      { section: 'ACCOUNT', items: [
        { label: 'Profile', path: '/profile', icon: PersonOutlineIcon },
      ]},
    ]
  }
}

// Flat list for any code that needs it (e.g., breadcrumbs)
export function getFlatNavigation(role) {
  return getNavigation(role).flatMap(s => s.items)
}
