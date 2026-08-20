import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
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

// Create/edit a member profile. When creating, a login (username/password) is included.
// When editing, only profile fields are sent. Existing members without a login can
// be given one via the "Create login" action.
// The dialog is mounted only while open, so form state is fresh per open.
export default function MemberFormDialog({ member, onClose, onSaved, open = true }) {
  const isEdit = Boolean(member)
  const [form, setForm] = useState(() => initialForm(member))
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="member-form-title">
      <DialogTitle id="member-form-title">{isEdit ? 'Edit Member' : 'Add Member'}</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" id="member-form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField label="Full name" name="name" value={form.name} onChange={handleChange} required fullWidth />
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} required fullWidth />
            <TextField label="Address" name="address" value={form.address} onChange={handleChange} fullWidth multiline minRows={2} />

            {!isEdit && (
              <>
                <Typography variant="caption" color="text.secondary">
                  A login account is created for new members.
                </Typography>
                <TextField label="Username" name="username" value={form.username} onChange={handleChange} required fullWidth />
                <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} required fullWidth helperText="At least 8 characters." />
              </>
            )}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {isEdit && !member?.user_id && (
          <Button onClick={handleCreateLogin} disabled={submitting} sx={{ mr: 'auto' }}>
            Create login
          </Button>
        )}
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="member-form"
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add Member'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
