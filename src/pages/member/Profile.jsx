import { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import InputAdornment from '@mui/material/InputAdornment'
import Tooltip from '@mui/material/Tooltip'

import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

import { useAuth } from '../../context/AuthContext.jsx'
import { updateMe } from '../../services/authService.js'
import apiClient, { getErrorMessage } from '../../services/apiClient.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import { initials } from '../../utils/format.js'

function startIcon(Icon) {
  return {
    startAdornment: (
      <InputAdornment position="start">
        <Icon sx={{ fontSize: 18, color: 'text.disabled' }} />
      </InputAdornment>
    ),
  }
}

// One read-only line in the identity panel.
function IdentityRow({ icon: Icon, label, value, mono = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
      <Icon sx={{ fontSize: 17, color: 'text.disabled', mt: 0.25 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="overline" sx={{ display: 'block', color: 'text.disabled', lineHeight: 1.6 }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            wordBreak: 'break-word',
            ...(mono ? { fontFamily: (t) => t.typography.fontFamilyMonospace, fontSize: '0.8125rem' } : {}),
          }}
        >
          {value || '—'}
        </Typography>
      </Box>
    </Box>
  )
}

export default function Profile() {
  const { user, refreshUser } = useAuth()
  // Name, phone and address are stored on the borrower profile, which librarian
  // accounts do not have. For them the backend can only save the email address,
  // so those fields are read-only here rather than appearing to save.
  const isLibrarian = user?.role === 'librarian'
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
  const [showPasswords, setShowPasswords] = useState(false)

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
    if (!form.email.trim()) {
      setError('Please enter an email address.')
      return
    }
    if (!isLibrarian && (!form.name.trim() || !form.phone.trim())) {
      setError('Please fill in name, email, and phone.')
      return
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    setSaving(true)
    try {
      // Only send what this account can actually store, so the success message
      // never claims a field was saved when it was not.
      await updateMe(
        isLibrarian
          ? { email: form.email.trim() }
          : {
              name: form.name.trim(),
              email: form.email.trim(),
              phone: form.phone.trim(),
              address: form.address.trim() || null,
            },
      )
      setSuccess(isLibrarian ? 'Email updated successfully.' : 'Profile updated successfully.')
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
      // Go through the shared client so this page has no API URL or token key of
      // its own: the base URL comes from apiClient's single configuration and the
      // request interceptor attaches the JWT. getErrorMessage() already has a
      // change-password branch, so the message shown on failure is unchanged.
      await apiClient.post('/auth/change-password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      })
      setSuccess('Password changed successfully.')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setChangingPassword(false)
    }
  }

  const passwordVisibilityAdornment = (
    <InputAdornment position="end">
      <IconButton
        size="small"
        onClick={() => setShowPasswords((v) => !v)}
        aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
        edge="end"
      >
        {showPasswords ? (
          <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
        ) : (
          <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
        )}
      </IconButton>
    </InputAdornment>
  )

  const passwordType = showPasswords ? 'text' : 'password'

  return (
    <Box>
      <PageHeader
        title="Profile"
        subtitle="Your account details and password."
        icon={BadgeOutlinedIcon}
        meta={<Chip size="small" variant="outlined" label={isLibrarian ? 'Librarian account' : 'Member account'} />}
      />

      {(error || success) && (
        <Alert
          severity={error ? 'error' : 'success'}
          sx={{ mb: 2.5 }}
          onClose={() => {
            setError(null)
            setSuccess(null)
          }}
        >
          {error || success}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={4}>
          <SectionCard title="Account" subtitle="How you appear in BookHive" icon={PersonOutlineIcon}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '1.25rem',
                  fontWeight: 650,
                }}
              >
                {initials(user?.name || user?.username)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }} noWrap>
                  {user?.name || user?.username}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <Stack
              spacing={2}
              sx={{ pt: 2.25, borderTop: '1px solid', borderColor: 'divider' }}
            >
              <IdentityRow icon={PersonOutlineIcon} label="Username" value={user?.username} mono />
              <IdentityRow
                icon={ShieldOutlinedIcon}
                label="Role"
                value={isLibrarian ? 'Librarian' : 'Member'}
              />
              {user?.membership_id && (
                <IdentityRow icon={BadgeOutlinedIcon} label="Membership ID" value={user.membership_id} mono />
              )}
              {!isLibrarian && <IdentityRow icon={PhoneOutlinedIcon} label="Phone" value={user?.phone} />}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Stack spacing={2.5}>
            <SectionCard
              title="Personal information"
              subtitle={
                isLibrarian
                  ? 'Librarian accounts can only change the email address.'
                  : 'Keep your contact details current so the library can reach you.'
              }
              icon={PersonOutlineIcon}
            >
              <Box component="form" onSubmit={handleSaveProfile}>
                <Stack spacing={2}>
                  {isLibrarian && (
                    <Alert severity="info" icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />}>
                      Name, phone and address live on borrower profiles, which librarian accounts do not have.
                    </Alert>
                  )}

                  <TextField
                    label="Full name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required={!isLibrarian}
                    disabled={isLibrarian}
                    fullWidth
                    InputProps={startIcon(PersonOutlineIcon)}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={7}>
                      <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        fullWidth
                        InputProps={startIcon(MailOutlineIcon)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <TextField
                        label="Phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required={!isLibrarian}
                        disabled={isLibrarian}
                        fullWidth
                        InputProps={startIcon(PhoneOutlinedIcon)}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    disabled={isLibrarian}
                    fullWidth
                    multiline
                    minRows={3}
                  />

                  <Box sx={{ pt: 0.5 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                      {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </SectionCard>

            <SectionCard
              title="Password"
              subtitle="Use at least 8 characters."
              icon={LockOutlinedIcon}
              iconColor="warning"
              action={
                <Tooltip title={showPasswords ? 'Hide passwords' : 'Show passwords'}>
                  <IconButton size="small" onClick={() => setShowPasswords((v) => !v)}>
                    {showPasswords ? (
                      <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                    )}
                  </IconButton>
                </Tooltip>
              }
            >
              <Box component="form" onSubmit={handleChangePassword}>
                <Stack spacing={2}>
                  <TextField
                    label="Current password"
                    name="currentPassword"
                    type={passwordType}
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    fullWidth
                    autoComplete="current-password"
                    InputProps={{
                      ...startIcon(LockOutlinedIcon),
                      endAdornment: passwordVisibilityAdornment,
                    }}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="New password"
                        name="newPassword"
                        type={passwordType}
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        required
                        fullWidth
                        autoComplete="new-password"
                        helperText="At least 8 characters."
                        InputProps={startIcon(LockOutlinedIcon)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Confirm new password"
                        name="confirmPassword"
                        type={passwordType}
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        fullWidth
                        autoComplete="new-password"
                        error={Boolean(
                          passwordForm.confirmPassword &&
                            passwordForm.newPassword !== passwordForm.confirmPassword,
                        )}
                        helperText={
                          passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                            ? 'Passwords do not match.'
                            : ' '
                        }
                        InputProps={startIcon(LockOutlinedIcon)}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ pt: 0.5 }}>
                    <Button
                      type="submit"
                      variant="outlined"
                      disabled={changingPassword}
                      startIcon={
                        changingPassword ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <LockOutlinedIcon sx={{ fontSize: 17 }} />
                        )
                      }
                    >
                      {changingPassword ? 'Changing…' : 'Change password'}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}
