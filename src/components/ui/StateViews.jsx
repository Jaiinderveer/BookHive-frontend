import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'

// Centered spinner for full-section loading.
export function LoadingState({ label = 'Loading…' }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
      <CircularProgress size={36} thickness={4} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  )
}

// Skeleton rows that mirror a table while data loads.
export function TableLoadingState({ rows = 5, columns = 4 }) {
  return (
    <Box sx={{ p: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Stack key={i} direction="row" spacing={2} sx={{ py: 1.5, alignItems: 'center' }}>
          {Array.from({ length: columns }).map((__, j) => (
            <Skeleton key={j} variant="text" sx={{ flex: 1, maxWidth: j === 0 ? 220 : undefined }} />
          ))}
        </Stack>
      ))}
    </Box>
  )
}

// Friendly empty state.
export function EmptyState({ title = 'Nothing here yet', description, action }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 8, px: 2 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: 'primary.light',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <InboxOutlinedIcon />
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  )
}

// Readable error state with optional retry.
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 8, px: 2 }}>
      <Typography variant="h6" color="error" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mb: 2 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="primary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Box>
  )
}
