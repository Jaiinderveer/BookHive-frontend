import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import CircularProgress from '@mui/material/CircularProgress'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded'

// Reusable confirmation dialog for destructive / important actions.
// The tonal icon states the severity before the text is read.
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
}) {
  const Icon = danger ? WarningAmberRoundedIcon : HelpOutlineRoundedIcon
  const tone = danger ? 'error' : 'primary'

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-dialog-title"
    >
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Box sx={{ display: 'flex', gap: 1.75, alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${tone}.light`,
              color: (t) => (t.palette.mode === 'light' ? `${tone}.dark` : `${tone}.main`),
            }}
          >
            <Icon sx={{ fontSize: 21 }} />
          </Box>
          <Box sx={{ minWidth: 0, pt: 0.25 }}>
            <DialogTitle
              id="confirm-dialog-title"
              sx={{ p: 0, mb: message ? 0.75 : 0, fontSize: '1.0625rem' }}
            >
              {title}
            </DialogTitle>
            {message && <DialogContentText sx={{ m: 0 }}>{message}</DialogContentText>}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading} color="inherit" variant="text">
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          color={danger ? 'error' : 'primary'}
          variant="contained"
          startIcon={loading ? <CircularProgress size={15} color="inherit" /> : null}
        >
          {loading ? 'Please wait…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
