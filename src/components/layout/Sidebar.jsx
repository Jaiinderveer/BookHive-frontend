import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { useLocation, useNavigate } from 'react-router-dom'
import { getNavigation } from '../../utils/navigation.js'
import { useTheme } from '../../context/ThemeContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export const DRAWER_WIDTH = 260

function BookHiveLogo() {
  const { resolvedMode } = useTheme()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, py: 2 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          flexShrink: 0,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a1.5 1.5 0 0 1-1.5 1.5H6.5A2.5 2.5 0 0 0 4 17.5v-12Z"
            fill="currentColor"
            opacity="0.35"
          />
          <path
            d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20v6H6.5A2.5 2.5 0 0 1 4 18.5v-1Z"
            fill="currentColor"
          />
        </svg>
      </Box>
      <Box>
        <Typography variant="h6" sx={{ lineHeight: 1.1, color: 'text.primary', fontWeight: 800, letterSpacing: '-0.02em' }}>
          BookHive
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          Smart Library
        </Typography>
      </Box>
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
          bgcolor: 'background.paper',
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
            bgcolor: 'rgba(15, 23, 42, 0.5)',
            display: mobileOpen ? 'block' : 'none',
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
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 225ms cubic-bezier(0, 0, 0.2, 1)',
            zIndex: 1300,
            overflowY: 'auto',
          }}
        >
          <SidebarContent sections={sections} location={location} onNavigate={handleNavigate} />
        </Box>
      </Box>
    </Box>
  )
}

function SidebarContent({ sections, location, onNavigate }) {
  const { resolvedMode } = useTheme()
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <BookHiveLogo />
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 1, py: 1 }}>
        {sections.map((section, sectionIndex) => (
          <Box key={section.section} sx={{ px: 1, py: 0.5 }}>
            {section.section && (
              <Typography
                variant="overline"
                sx={{
                  color: 'text.secondary',
                  mb: 1,
                  px: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                {section.section}
              </Typography>
            )}
            <List sx={{ px: 0.5, mt: 0.5 }}>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <ListItemButton
                    key={item.path}
                    onClick={() => onNavigate(item.path)}
                    selected={isActive}
                    sx={{
                      borderRadius: 10,
                      mb: 0.25,
                      px: 1.5,
                      py: 1,
                      color: isActive ? 'primary.main' : 'text.secondary',
                      '&.Mui-selected': {
                        bgcolor: resolvedMode === 'dark' ? 'primary.900' : 'primary.50',
                        color: resolvedMode === 'dark' ? 'primary.100' : 'primary.700',
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: resolvedMode === 'dark' ? 'primary.800' : 'primary.100',
                        },
                        '& .MuiListItemIcon-root': { color: 'primary.main' },
                      },
                      '&:hover': {
                        bgcolor: isActive
                          ? (resolvedMode === 'dark' ? 'primary.800' : 'primary.100')
                          : 'action.hover',
                        color: isActive
                          ? (resolvedMode === 'dark' ? 'primary.100' : 'primary.700')
                          : 'text.primary',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'inherit' }}>
                      <Icon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}
                    />
                  </ListItemButton>
                )
              })}
            </List>
            {sectionIndex < sections.length - 1 && (
              <Divider sx={{ my: 1.5 }} />
            )}
          </Box>
        ))}
      </Box>
      <Divider />
      <Box sx={{ px: 2.5, py: 1.5 }}>
        <ThemeToggle />
      </Box>
      <Box sx={{ px: 2.5, pb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          © {new Date().getFullYear()} BookHive
        </Typography>
      </Box>
    </Box>
  )
}
