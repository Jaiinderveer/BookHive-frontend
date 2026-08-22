import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined'
import { useNavigate } from 'react-router-dom'
import MessagePage from '../components/ui/MessagePage.jsx'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <MessagePage
      icon={SearchOffOutlinedIcon}
      iconColor="info"
      code="404"
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      actions={
        <>
          <Button
            variant="contained"
            startIcon={<SpaceDashboardOutlinedIcon sx={{ fontSize: 17 }} />}
            onClick={() => navigate('/dashboard')}
          >
            Go to dashboard
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIcon sx={{ fontSize: 17 }} />}
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
        </>
      }
      footer={
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          BookHive · Library Management
        </Typography>
      }
    />
  )
}
