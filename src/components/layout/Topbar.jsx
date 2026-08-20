import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import LogoutIcon from '@mui/icons-material/Logout'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import { initials } from '../../utils/format.js'
import { getFlatNavigation } from '../../utils/navigation.js'
import { useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'

export default function Topbar({ onMenuClick, user, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const location = useLocation()

  const navItems = getFlatNavigation(user?.role)
  const current = navItems.find((item) => item.path === location.pathname)

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)
  const handleLogout = () => {
    handleMenuClose()
    onLogout?.()
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, md: 64 }, px: { xs: 2, md: 3 } }}>
        <IconButton
          edge="start"
          aria-label="Open navigation"
          onClick={onMenuClick}
          sx={{ mr: 1, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: { xs: 'none', sm: 'block' }, mr: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {current?.label || 'BookHive'}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {user?.role && (
            <Chip
              label={user.role === 'librarian' ? 'Librarian' : 'Member'}
              size="small"
              color={user.role === 'librarian' ? 'primary' : 'default'}
              variant="outlined"
              sx={{ display: { xs: 'none', sm: 'inline-flex' }, textTransform: 'capitalize', fontWeight: 500 }}
            />
          )}
          <Tooltip title="Theme">
            <ThemeToggle />
          </Tooltip>
          <Tooltip title="Account">
            <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 0.5 }} aria-haspopup="true" aria-label="Account menu">
              <Avatar
                sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 600 }}
              >
                {initials(user?.username)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 220, mt: 0.5 } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user?.username}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ px: 2, py: 1 }}>
          <ListItemIcon sx={{ minWidth: 36, color: 'error.main' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2" color="error.main">Sign out</Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  )
}
