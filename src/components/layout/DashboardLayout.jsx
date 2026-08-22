import { useState } from 'react'
import Box from '@mui/material/Box'
import { Outlet } from 'react-router-dom'
import Sidebar, { DRAWER_WIDTH } from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        role={user?.role}
      />
      {/* Offset fixed sidebar on desktop */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          marginLeft: { md: `${DRAWER_WIDTH}px` },
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} user={user} onLogout={logout} />
        <Box
          sx={{
            px: { xs: 2, sm: 2.5, md: 3.5, lg: 4 },
            py: { xs: 2.5, sm: 3, md: 3.5, lg: 4 },
            flexGrow: 1,
            minWidth: 0,
            width: '100%',
            maxWidth: { xl: '1560px' },
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
