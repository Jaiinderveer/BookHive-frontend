import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'

import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'

import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../services/apiClient.js'
import ThemeToggle from '../components/layout/ThemeToggle.jsx'

const EMPTY = { username: '', password: '', name: '', phone: '', address: '', email: '' }

const HIGHLIGHTS = [
  {
    icon: LibraryBooksOutlinedIcon,
    title: 'One catalogue, always current',
    description: 'Copies, availability and categories stay in step with every issue and return.',
  },
  {
    icon: InsightsOutlinedIcon,
    title: 'Circulation at a glance',
    description: 'Loans, returns, overdue books and fines summarised the moment you sign in.',
  },
  {
    icon: AutoAwesomeOutlinedIcon,
    title: 'Ask instead of hunting',
    description: 'The built-in assistant answers questions and runs operations on live data.',
  },
]

function BrandMark({ size = 46, radius = 14 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: `${radius}px`,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a1.5 1.5 0 0 1-1.5 1.5H6.5A2.5 2.5 0 0 0 4 17.5v-12Z"
          fill="currentColor"
          opacity="0.35"
        />
        <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20v6H6.5A2.5 2.5 0 0 1 4 18.5v-1Z" fill="currentColor" />
      </svg>
    </Box>
  )
}

export default function Login() {
  const [mode, setMode] = useState(0) // 0 = sign in, 1 = create account
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 0) {
        await login(form.username.trim(), form.password)
      } else {
        await register({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim() || null,
        })
      }
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr', lg: '1.05fr 1fr' },
        bgcolor: 'background.default',
      }}
    >
      {/* Brand column: context for the product, only where there is room for it. */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: 7,
          py: 6,
          bgcolor: 'background.subtle',
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <BrandMark />
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              BookHive
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Library Management
            </Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 460 }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Run the library, not the paperwork.
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 5 }}>
            BookHive keeps your catalogue, members and circulation in one place — with an
            assistant that can answer questions about all of it.
          </Typography>

          <Stack spacing={3}>
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <Box key={title} sx={{ display: 'flex', gap: 2 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 2,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'primary.main',
                  }}
                >
                  <Icon sx={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.25 }}>
                    {title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          © {new Date().getFullYear()} BookHive · Smart Library Management
        </Typography>
      </Box>

      {/* Auth column */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 4 },
          py: { xs: 4, sm: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 424 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3,
            }}
          >
            <Box sx={{ display: { xs: 'flex', lg: 'none' }, alignItems: 'center', gap: 1.5 }}>
              <BrandMark size={38} radius={11} />
              <Box>
                <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }}>
                  BookHive
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Library Management
                </Typography>
              </Box>
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <ThemeToggle />
            </Box>
          </Box>

          <Typography variant="h4" component="h1" sx={{ mb: 0.75 }}>
            {mode === 0 ? 'Sign in' : 'Create your account'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {mode === 0
              ? 'Use your BookHive username or email to continue.'
              : 'Register as a member to browse the catalogue and track your loans.'}
          </Typography>

          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Tabs
                value={mode}
                onChange={(_, v) => {
                  setMode(v)
                  setError(null)
                }}
                variant="fullWidth"
                sx={{ mb: 3 }}
              >
                <Tab label="Sign in" />
                <Tab label="Create account" />
              </Tabs>

              {error && (
                <Alert severity="error" sx={{ mb: 2.5 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2}>
                  <TextField
                    label="Username or email"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete={mode === 0 ? 'current-password' : 'new-password'}
                    fullWidth
                    helperText={mode === 1 ? 'At least 8 characters.' : undefined}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            edge="end"
                          >
                            {showPassword ? (
                              <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {mode === 1 && (
                    <>
                      <TextField
                        label="Full name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        fullWidth
                      />
                      <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        fullWidth
                      />
                      <TextField
                        label="Phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        fullWidth
                      />
                      <TextField
                        label="Address (optional)"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        minRows={2}
                      />
                    </>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{ mt: 0.5 }}
                  >
                    {submitting ? 'Please wait…' : mode === 0 ? 'Sign in' : 'Create account'}
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Typography
            variant="caption"
            sx={{ display: 'block', mt: 2.5, textAlign: 'center', color: 'text.disabled' }}
          >
            {mode === 0
              ? 'Librarian accounts are created by an administrator.'
              : 'Creating an account registers you as a library member.'}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
