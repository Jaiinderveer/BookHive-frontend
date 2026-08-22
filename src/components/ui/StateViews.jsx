import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import RefreshIcon from '@mui/icons-material/Refresh'

// Centered spinner for full-section loading.
export function LoadingState({ label = 'Loading…', compact = false }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: compact ? 4 : 8,
        gap: 1.75,
      }}
    >
      <CircularProgress size={compact ? 22 : 30} thickness={4.5} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  )
}

// Skeleton rows that mirror a table while data loads.
// Widths vary per column so the placeholder reads as content, not as a grid.
export function TableLoadingState({ rows = 5, columns = 4 }) {
  const widths = ['58%', '86%', '70%', '48%', '64%', '76%', '52%']
  return (
    <Box sx={{ px: 2, py: 1 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Stack
          key={i}
          direction="row"
          spacing={2.5}
          sx={{
            py: 1.75,
            alignItems: 'center',
            borderBottom: i < rows - 1 ? '1px solid' : 'none',
            borderColor: 'divider',
            opacity: 1 - i * 0.12,
          }}
        >
          {Array.from({ length: columns }).map((__, j) => (
            <Box key={j} sx={{ flex: 1, minWidth: 0 }}>
              <Skeleton
                variant="text"
                height={j === 0 ? 20 : 14}
                sx={{ width: widths[(i + j) % widths.length], maxWidth: j === 0 ? 240 : undefined }}
              />
            </Box>
          ))}
        </Stack>
      ))}
    </Box>
  )
}

// Card-shaped skeletons for grid layouts (e.g. the member book browser).
export function CardGridLoadingState({ count = 6, height = 132 }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={height} sx={{ transform: 'none', opacity: 1 - i * 0.08 }} />
      ))}
    </Box>
  )
}

/*
 * Empty state. The dashed frame signals "a container that could hold something"
 * rather than "an error", which is the distinction users actually need.
 */
export function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
  icon: Icon = InboxOutlinedIcon,
  compact = false,
  bordered = true,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        py: compact ? 4 : 7,
        px: 3,
        ...(bordered && {
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.subtle',
        }),
      }}
    >
      <Box
        sx={{
          width: compact ? 40 : 48,
          height: compact ? 40 : 48,
          borderRadius: 2.5,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          color: 'text.disabled',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.75,
        }}
      >
        <Icon sx={{ fontSize: compact ? 20 : 23 }} />
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 620 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mt: 0.5 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2.25 }}>{action}</Box>}
    </Box>
  )
}

// Readable error state with optional retry.
export function ErrorState({ message = 'Something went wrong.', onRetry, title = 'Something went wrong', compact = false }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        py: compact ? 4 : 7,
        px: 3,
        border: '1px solid',
        borderColor: (t) => (t.palette.mode === 'light' ? 'rgba(192, 54, 44, 0.2)' : 'rgba(240, 131, 121, 0.24)'),
        borderRadius: 3,
        bgcolor: 'error.light',
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.5,
          bgcolor: 'background.paper',
          color: 'error.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1.75,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 22 }} />
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 620, color: (t) => (t.palette.mode === 'light' ? 'error.dark' : 'error.main') }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ maxWidth: 440, mt: 0.5, color: (t) => (t.palette.mode === 'light' ? 'error.dark' : 'error.main'), opacity: 0.9 }}
      >
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          color="error"
          onClick={onRetry}
          startIcon={<RefreshIcon sx={{ fontSize: 17 }} />}
          sx={{ mt: 2.25, bgcolor: 'background.paper' }}
        >
          Try again
        </Button>
      )}
    </Box>
  )
}
