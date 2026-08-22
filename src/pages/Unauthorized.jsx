import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined'
import { useNavigate } from 'react-router-dom'
import MessagePage from '../components/ui/MessagePage.jsx'

export default function Unauthorized() {
  const navigate = useNavigate()
  return (
    <MessagePage
      icon={LockOutlinedIcon}
      iconColor="warning"
      code="403"
      title="You don't have access"
      description="This page is limited to a different role. If you think that's a mistake, ask your librarian to check your account."
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
