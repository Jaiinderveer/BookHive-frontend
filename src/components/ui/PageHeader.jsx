import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

// Standard page heading with optional action buttons.
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
        <Box>
          <Typography variant="h5" component="h1">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Stack direction="row" gap={1} flexWrap="wrap">{actions}</Stack>}
      </Stack>
    </Box>
  )
}
