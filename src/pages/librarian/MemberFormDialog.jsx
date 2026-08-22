import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'

import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import CloseIcon from '@mui/icons-material/Close'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'

import { createMember, updateMember, createMemberAccount } from '../../services/memberService.js'
import { getErrorMessage } from '../../services/apiClient.js'

const EMPTY = { name: '', email: '', phone: '', address: '', username: '', password: '' }

function initialForm(member) {
  if (!member) return EMPTY
  return {
    name: member.name || '',
    email: member.email || '',
    phone: member.phone || '',
    address: member.address || '',
    username: '',
    password: '',
  }
}

// Small labelled group so a long form reads as a few short ones.
function FormSection({ label, hint, children }) {
  return (
    <Box>
      <Typography variant="overline" sx={{ display: 'block', color: 'text.disabled', mb: 0.25 }}>
        {label}
      </Typography>
      {hint && (
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1.5 }}>
          {hint}
        </Typography>
      )}
      <Box sx={{ mt: hint ? 0 : 1.25 }}>{children}</Box>
    </Box>
  )
}

function startIcon(Icon) {
  return {
    startAdornment: (
      <InputAdornment position="start">
        <Icon sx={{ fontSize: 18, color: 'text.disabled' }} />
      </InputAdornment>
    ),
  }
}

// Create/edit a member profile. When creating, a login (username/password) is included.
// When editing, only profile fields are sent. Existing members without a login can
// be given one via the "Create login" action.
// The dialog is mounted only while open, so form state is fresh per open.
export default function MemberFormDialog({ member, onClose, onSaved, open = true }) {
  const isEdit = Boolean(member)
  const [form, setForm] = useState(() => initialForm(member))
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const canCreateLogin = isEdit && !member?.user_id

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please fill in name, email, and phone.')
      return
    }
    if (form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.')
      return
    }

    const profilePayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      address: form.address.trim() || null,
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateMember(member.id, profilePayload)
      } else {
        if (!form.username.trim() || form.password.length < 8) {
          setError('Username and a password of at least 8 characters are required for new members.')
          setSubmitting(false)
          return
        }
        await createMember({ ...profilePayload, username: form.username.trim(), password: form.password })
      }
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  const handleCreateLogin = async () => {
    if (!member) return
    setError(null)
    if (!form.username.trim() || form.password.length < 8) {
      setError('Enter a username and a password of at least 8 characters.')
      return
    }
    setSubmitting(true)
    try {
      await createMemberAccount(member.id, { username: form.username.trim(), password: form.password })
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  const passwordField = (
    <TextField
      label="Password"
      name="password"
      type={showPassword ? 'text' : 'password'}
      value={form.password}
      onChange={handleChange}
      required={!isEdit}
      fullWidth
      autoComplete="new-password"
      helperText="At least 8 characters."
      InputProps={{
        ...startIcon(LockOutlinedIcon),
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
  )

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="member-form-title">
      <DialogTitle id="member-form-title" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'info.light',
            color: (t) => (t.palette.mode === 'light' ? 'info.dark' : 'info.main'),
          }}
        >
          <PersonOutlineIcon sx={{ fontSize: 19 }} />
        </Box>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="h6" component="span" sx={{ display: 'block', lineHeight: 1.3 }}>
            {isEdit ? 'Edit member' : 'Add a member'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            {isEdit
              ? member.membership_id || member.name
              : 'Register a member and give them a login for the catalogue.'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={submitting} aria-label="Close" sx={{ mt: -0.5, mr: -0.5 }}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {error}
          </Alert>
        )}

        <Box component="form" id="member-form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <FormSection label="Member details" hint="Name, email and phone are required.">
              <Stack spacing={2}>
                <TextField
                  label="Full name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  autoFocus
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
                      required
                      fullWidth
                      InputProps={startIcon(PhoneOutlinedIcon)}
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Address (optional)"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Stack>
            </FormSection>

            {!isEdit && (
              <FormSection label="Login" hint="A login account is created for new members.">
                <Stack spacing={2}>
                  <TextField
                    label="Username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    fullWidth
                    autoComplete="off"
                    InputProps={startIcon(PersonOutlineIcon)}
                  />
                  {passwordField}
                </Stack>
              </FormSection>
            )}
          </Stack>
        </Box>

        {/*
          Editing a member who has no login: the credential fields live outside the
          profile form so Enter still saves the profile, and the action that uses
          them sits next to them instead of in the dialog footer.
        */}
        {canCreateLogin && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: 'background.subtle',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
              <KeyOutlinedIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
              <Typography variant="subtitle2">This member has no login</Typography>
            </Box>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 2 }}>
              Give them a username and password so they can browse the catalogue and track their loans.
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                fullWidth
                autoComplete="off"
                InputProps={startIcon(PersonOutlineIcon)}
              />
              {passwordField}
              <Button
                onClick={handleCreateLogin}
                disabled={submitting}
                variant="outlined"
                startIcon={<KeyOutlinedIcon sx={{ fontSize: 17 }} />}
                sx={{ alignSelf: 'flex-start' }}
              >
                Create login
              </Button>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          form="member-form"
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add member'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
