import React from 'react'
import { useTheme } from '../../context/ThemeContext.jsx'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto'

const MODES = [
  { value: 'light', label: 'Light', icon: <Brightness7Icon fontSize="small" /> },
  { value: 'dark', label: 'Dark', icon: <Brightness4Icon fontSize="small" /> },
  { value: 'system', label: 'System', icon: <BrightnessAutoIcon fontSize="small" /> },
]

export default function ThemeToggle() {
  const { mode, resolvedMode, setTheme } = useTheme()
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const handleSelect = (newMode) => {
    setTheme(newMode)
    handleClose()
  }

  const currentMode = MODES.find((m) => m.value === mode) || MODES[0]

  return (
    <Box>
      <Tooltip title={`Theme: ${currentMode.label}`} arrow>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{ borderRadius: 10 }}
          aria-haspopup="true"
          aria-label="Theme options"
        >
          {currentMode.icon}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 180, mt: 0.5 } } }}
      >
        {MODES.map((m) => (
          <MenuItem
            key={m.value}
            onClick={() => handleSelect(m.value)}
            selected={mode === m.value}
            sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}
          >
            <ListItemIcon sx={{ color: mode === m.value ? 'primary.main' : 'inherit' }}>
              {m.icon}
            </ListItemIcon>
            <Typography variant="body2">{m.label}</Typography>
            {mode === m.value && (
              <Box sx={{ ml: 'auto', width: 16, height: 16, borderRadius: '50%', bgcolor: 'primary.main' }} />
            )}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}