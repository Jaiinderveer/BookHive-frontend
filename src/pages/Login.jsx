import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../services/apiClient.js'

const EMPTY = { username: '', password: '', name: '', phone: '', address: '', email: '' }

export default function Login() {
  const [mode, setMode] = useState(0) // 0 = sign in, 1 = create account
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              mx: 'auto',
              mb: 1.5,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a1.5 1.5 0 0 1-1.5 1.5H6.5A2.5 2.5 0 0 0 4 17.5v-12Z" fill="currentColor" opacity="0.35" />
              <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20v6H6.5A2.5 2.5 0 0 1 4 18.5v-1Z" fill="currentColor" />
            </svg>
          </Box>
          <Typography variant="h4" component="h1">
            BookHive
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-powered Smart Library Management System
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Tabs
              value={mode}
              onChange={(_, v) => {
                setMode(v)
                setError(null)
              }}
              centered
              sx={{ mb: 3 }}
            >
              <Tab label="Sign in" />
              <Tab label="Create account" />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
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
                />
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete={mode === 0 ? 'current-password' : 'new-password'}
                  fullWidth
                  helperText={mode === 1 ? 'At least 8 characters.' : undefined}
                />

                {mode === 1 && (
                  <>
                    <TextField label="Full name" name="name" value={form.name} onChange={handleChange} required fullWidth />
                    <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
                    <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} required fullWidth />
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
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  {submitting ? 'Please wait…' : mode === 0 ? 'Sign in' : 'Create account'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
