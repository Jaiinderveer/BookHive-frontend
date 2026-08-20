import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3,
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          bgcolor: 'info.light',
          color: 'info.dark',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <SearchOffOutlinedIcon />
      </Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mb: 3 }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </Button>
    </Box>
  )
}
