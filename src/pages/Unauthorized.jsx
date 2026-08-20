import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { useNavigate } from 'react-router-dom'

export default function Unauthorized() {
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
          bgcolor: 'warning.light',
          color: 'warning.dark',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <LockOutlinedIcon />
      </Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Unauthorized
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mb: 3 }}>
        You don&apos;t have permission to access this page. If you believe this is a mistake,
        contact your librarian.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </Button>
    </Box>
  )
}
