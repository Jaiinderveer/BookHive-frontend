import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { useAuth } from '../../context/AuthContext.jsx'
import { updateMe } from '../../services/authService.js'
import { getErrorMessage } from '../../services/apiClient.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { initials } from '../../utils/format.js'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please fill in name, email, and phone.')
      return
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    setSaving(true)
    try {
      await updateMe({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim() || null,
      })
      setSuccess('Profile updated successfully.')
      await refreshUser()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Please fill in all password fields.')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    setChangingPassword(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('bookhive_token')}`,
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to change password')
      }
      setSuccess('Password changed successfully.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <Box>
      <PageHeader title="Profile" subtitle="Manage your account settings" />
      
      <Stack spacing={3}>
        {/* Profile Info */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 32, fontWeight: 700 }}
              >
                {initials(user?.username)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>{user?.name}</Typography>
                <Typography variant="body1" color="text.secondary">{user?.email}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.role === 'librarian' ? 'Librarian' : 'Member'}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Box component="form" onSubmit={handleSaveProfile}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700} gutterBottom>Personal Information</Typography>
                <TextField label="Full Name" name="name" value={form.name} onChange={handleChange} required fullWidth />
                <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
                <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} required fullWidth />
                <TextField
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={3}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>Change Password</Typography>
            <Box component="form" onSubmit={handleChangePassword}>
              <Stack spacing={2}>
                <TextField
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  fullWidth
                />
                <TextField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  fullWidth
                  helperText="At least 8 characters."
                />
                <TextField
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={changingPassword}
                  startIcon={changingPassword ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {(error || success) && (
        <Alert severity={error ? 'error' : 'success'} sx={{ mt: 2 }} onClose={() => { setError(null); setSuccess(null); }}>
          {error || success}
        </Alert>
      )}
    </Box>
  )
}