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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import { initials } from '../../utils/format.js'
import { getNavigation } from '../../utils/navigation.js'
import { useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'
import { BookHiveMark } from './Sidebar.jsx'

// Resolve the current route to "<Section> / <Page>" so the topbar states where
// you are, not just what page you are on.
function useCurrentLocation(role) {
  const location = useLocation()
  const sections = getNavigation(role)
  for (const section of sections) {
    const item = section.items.find((entry) => entry.path === location.pathname)
    if (item) return { section: section.section, label: item.label, icon: item.icon }
  }
  return { section: null, label: null, icon: null }
}

export default function Topbar({ onMenuClick, user, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const current = useCurrentLocation(user?.role)
  const isLibrarian = user?.role === 'librarian'

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
      <Toolbar sx={{ minHeight: { xs: 60, md: 64 }, px: { xs: 1.5, sm: 2, md: 3 }, gap: 1 }}>
        <IconButton
          edge="start"
          aria-label="Open navigation"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' }, color: 'text.secondary' }}
        >
          <MenuIcon />
        </IconButton>

        {/* The mark stands in for the sidebar brand while the drawer is closed. */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          <BookHiveMark size={30} radius={9} />
        </Box>

        <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
          {current.section && (
            <Typography
              variant="overline"
              component="div"
              sx={{ color: 'text.disabled', fontSize: '0.625rem', lineHeight: 1.3 }}
            >
              {current.section}
            </Typography>
          )}
          <Typography
            variant="h6"
            component="h1"
            noWrap
            sx={{ fontSize: '1rem', lineHeight: 1.25, color: 'text.primary' }}
          >
            {current.label || 'BookHive'}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          {user?.role && (
            <Chip
              label={isLibrarian ? 'Librarian' : 'Member'}
              size="small"
              color={isLibrarian ? 'primary' : 'default'}
              sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            />
          )}
          <Tooltip title="Appearance">
            <ThemeToggle />
          </Tooltip>

          <Box
            onClick={handleMenuOpen}
            role="button"
            tabIndex={0}
            aria-haspopup="true"
            aria-label="Account menu"
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleMenuOpen(event)
              }
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              pl: 0.5,
              pr: { xs: 0.5, sm: 1 },
              py: 0.5,
              ml: 0.5,
              borderRadius: 2,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: { xs: 'transparent', sm: 'divider' },
              transition: 'background-color 0.15s, border-color 0.15s',
              '&:hover': { bgcolor: 'action.hover', borderColor: { sm: 'neutral.300' } },
              '&:focus-visible': { outline: (t) => `2px solid ${t.palette.primary.main}`, outlineOffset: 2 },
            }}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: isLibrarian ? 'primary.main' : 'secondary.main',
                color: isLibrarian ? 'primary.contrastText' : 'secondary.contrastText',
                fontSize: '0.75rem',
              }}
            >
              {initials(user?.username)}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0, maxWidth: 132 }}>
              <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.8125rem' }}
              >
                {user?.username || 'Account'}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{ display: 'block', color: 'text.secondary', fontSize: '0.6875rem', lineHeight: 1.3 }}
              >
                {user?.email || (isLibrarian ? 'Librarian' : 'Member')}
              </Typography>
            </Box>
            <ExpandMoreIcon
              sx={{ fontSize: 18, color: 'text.disabled', display: { xs: 'none', sm: 'block' } }}
            />
          </Box>
        </Box>
      </Toolbar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 248, mt: 0.75 } } }}
      >
        <Box sx={{ px: 1.5, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: isLibrarian ? 'primary.main' : 'secondary.main',
              color: isLibrarian ? 'primary.contrastText' : 'secondary.contrastText',
            }}
          >
            {initials(user?.username)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 660 }}>
              {user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ px: 1.5, pb: 1.25 }}>
          <Chip
            label={isLibrarian ? 'Librarian access' : 'Member access'}
            size="small"
            color={isLibrarian ? 'primary' : 'default'}
          />
        </Box>
        <Divider sx={{ mb: 0.5 }} />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ minWidth: 32, color: 'error.main' }}>
            <LogoutIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ fontWeight: 550 }}>
            Sign out
          </Typography>
        </MenuItem>
      </Menu>
    </AppBar>
  )
}
