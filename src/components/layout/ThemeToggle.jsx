import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext.jsx'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import CheckIcon from '@mui/icons-material/Check'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined'

const MODES = [
  { value: 'light', label: 'Light', Icon: LightModeOutlinedIcon },
  { value: 'dark', label: 'Dark', Icon: DarkModeOutlinedIcon },
  { value: 'system', label: 'System', Icon: SettingsBrightnessOutlinedIcon },
]

export default function ThemeToggle() {
  const { mode, setTheme } = useTheme()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)
  const handleSelect = (newMode) => {
    setTheme(newMode)
    handleClose()
  }

  const currentMode = MODES.find((m) => m.value === mode) || MODES[0]
  const CurrentIcon = currentMode.Icon

  return (
    <>
      <Tooltip title={`Theme: ${currentMode.label}`}>
        <IconButton
          onClick={handleClick}
          size="small"
          aria-haspopup="true"
          aria-label="Theme options"
          sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
        >
          <CurrentIcon sx={{ fontSize: 19 }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 176, mt: 0.75 } } }}
      >
        {MODES.map(({ value, label, Icon }) => (
          <MenuItem key={value} onClick={() => handleSelect(value)} selected={mode === value}>
            <ListItemIcon sx={{ minWidth: 30, color: mode === value ? 'primary.main' : 'text.secondary' }}>
              <Icon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ fontWeight: mode === value ? 600 : 450 }}>
              {label}
            </Typography>
            {mode === value && <CheckIcon sx={{ ml: 'auto', fontSize: 16, color: 'primary.main' }} />}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
