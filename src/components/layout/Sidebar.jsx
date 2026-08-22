import { useEffect } from 'react'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import { useLocation, useNavigate } from 'react-router-dom'
import { getNavigation } from '../../utils/navigation.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export const DRAWER_WIDTH = 264
// Brand row height, matched to the topbar so the two dividers form one line.
const BRAND_HEIGHT = { xs: 60, md: 64 }

export function BookHiveMark({ size = 34, radius = 10 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: `${radius}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        flexShrink: 0,
        position: 'relative',
        // A single hairline instead of a shadow keeps the mark crisp on both themes.
        boxShadow: (t) =>
          t.palette.mode === 'light'
            ? 'inset 0 0 0 1px rgba(255,255,255,0.14)'
            : 'inset 0 0 0 1px rgba(0,0,0,0.2)',
      }}
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a1.5 1.5 0 0 1-1.5 1.5H6.5A2.5 2.5 0 0 0 4 17.5v-12Z"
          fill="currentColor"
          opacity="0.38"
        />
        <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20v6H6.5A2.5 2.5 0 0 1 4 18.5v-1Z" fill="currentColor" />
      </svg>
      {/* Small brass tick — the one place the accent colour appears in the chrome. */}
      <Box
        sx={{
          position: 'absolute',
          right: -1,
          bottom: -1,
          width: size * 0.26,
          height: size * 0.26,
          borderRadius: '50%',
          bgcolor: 'secondary.main',
          border: '2px solid',
          borderColor: 'background.sidebar',
        }}
      />
    </Box>
  )
}

export function BookHiveWordmark({ subtitle = 'Library Management' }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="subtitle1"
        component="span"
        sx={{
          display: 'block',
          lineHeight: 1.15,
          color: 'text.primary',
          fontWeight: 700,
          fontSize: '1.0625rem',
          letterSpacing: '-0.025em',
        }}
      >
        BookHive
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          component="span"
          sx={{
            display: 'block',
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.6875rem',
            letterSpacing: '0.02em',
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}

export default function Sidebar({ mobileOpen, onClose, role }) {
  const location = useLocation()
  const navigate = useNavigate()
  const sections = getNavigation(role)

  const handleNavigate = (path) => {
    onClose?.()
    navigate(path)
  }

  // Escape closes the mobile drawer — expected of any overlay panel.
  useEffect(() => {
    if (!mobileOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, onClose])

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }} aria-label="Sidebar">
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: DRAWER_WIDTH,
          flexDirection: 'column',
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.sidebar',
          zIndex: 1200,
        }}
      >
        <SidebarContent sections={sections} location={location} onNavigate={handleNavigate} />
      </Box>

      {/* Mobile drawer */}
      <Box component="div" sx={{ display: { xs: 'block', md: 'none' } }}>
        <Box
          component="div"
          role="presentation"
          onClick={onClose}
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: (t) => (t.palette.mode === 'light' ? 'rgba(26, 26, 36, 0.42)' : 'rgba(4, 4, 8, 0.62)'),
            backdropFilter: 'blur(2px)',
            opacity: mobileOpen ? 1 : 0,
            visibility: mobileOpen ? 'visible' : 'hidden',
            transition: 'opacity 200ms ease, visibility 200ms ease',
            display: 'block',
            zIndex: 1299,
          }}
        />
        <Box
          component="aside"
          sx={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            width: DRAWER_WIDTH,
            maxWidth: '86vw',
            bgcolor: 'background.sidebar',
            borderRight: '1px solid',
            borderColor: 'divider',
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 225ms cubic-bezier(0.32, 0.72, 0, 1)',
            boxShadow: mobileOpen ? 6 : 'none',
            zIndex: 1300,
            overflowY: 'auto',
          }}
        >
          <SidebarContent
            sections={sections}
            location={location}
            onNavigate={handleNavigate}
            onClose={onClose}
          />
        </Box>
      </Box>
    </Box>
  )
}

function SidebarContent({ sections, location, onNavigate, onClose }) {
  const { resolvedMode } = useTheme()
  const isDark = resolvedMode === 'dark'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          px: 2,
          height: BRAND_HEIGHT,
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <BookHiveMark />
        <BookHiveWordmark />
        {onClose && (
          <IconButton
            aria-label="Close navigation"
            onClick={onClose}
            size="small"
            sx={{ ml: 'auto', color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, py: 2 }}>
        {sections.map((section, sectionIndex) => (
          <Box key={section.section} sx={{ mb: sectionIndex < sections.length - 1 ? 2.25 : 0 }}>
            {section.section && (
              <Typography
                variant="overline"
                component="div"
                sx={{ color: 'text.disabled', px: 1.5, mb: 0.75, fontSize: '0.625rem' }}
              >
                {section.section}
              </Typography>
            )}
            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <ListItemButton
                    key={item.path}
                    onClick={() => onNavigate(item.path)}
                    selected={isActive}
                    disableRipple
                    sx={{
                      position: 'relative',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.875,
                      minHeight: 38,
                      color: isActive ? (isDark ? 'primary.100' : 'primary.700') : 'text.secondary',
                      // The active rail: a short accent bar hooked to the left edge.
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: `translateY(-50%) scaleY(${isActive ? 1 : 0})`,
                        width: 3,
                        height: 18,
                        borderRadius: '0 3px 3px 0',
                        bgcolor: 'primary.main',
                        transition: 'transform 180ms cubic-bezier(0.32, 0.72, 0, 1)',
                      },
                      '&.Mui-selected': {
                        bgcolor: isDark ? 'rgba(154, 166, 240, 0.12)' : 'primary.50',
                        '&:hover': { bgcolor: isDark ? 'rgba(154, 166, 240, 0.18)' : 'primary.100' },
                      },
                      '&:hover': { bgcolor: 'action.hover', color: isActive ? undefined : 'text.primary' },
                    }}
                  >
                    <ListItemIcon
                      sx={{ minWidth: 32, color: isActive ? 'primary.main' : 'text.disabled' }}
                    >
                      <Icon sx={{ fontSize: 19 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.8438rem',
                        fontWeight: isActive ? 650 : 500,
                        letterSpacing: '-0.008em',
                      }}
                    />
                  </ListItemButton>
                )
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider />
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          Appearance
        </Typography>
        <ThemeToggle />
      </Box>
      <Box sx={{ px: 2, pb: 1.75 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}>
          © {new Date().getFullYear()} BookHive
        </Typography>
      </Box>
    </Box>
  )
}
