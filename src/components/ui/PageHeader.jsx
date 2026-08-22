import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

/*
 * Page heading. Optional `icon` renders a tonal tile to the left of the title
 * and `meta` sits under the subtitle for counts or last-updated lines.
 */
export default function PageHeader({ title, subtitle, actions, icon, iconColor = 'primary', meta }) {
  const Icon = icon
  return (
    <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        justifyContent="space-between"
        gap={{ xs: 2, sm: 2.5 }}
      >
        <Stack direction="row" spacing={1.75} sx={{ minWidth: 0, alignItems: 'flex-start' }}>
          {Icon && (
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                flexShrink: 0,
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${iconColor}.light`,
                color: (t) => (t.palette.mode === 'light' ? `${iconColor}.dark` : `${iconColor}.main`),
                mt: 0.25,
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" component="h1" sx={{ lineHeight: 1.2 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 680 }}>
                {subtitle}
              </Typography>
            )}
            {meta && <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>{meta}</Box>}
          </Box>
        </Stack>
        {actions && (
          <Stack
            direction="row"
            gap={1}
            flexWrap="wrap"
            sx={{ flexShrink: 0, alignItems: 'center', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}
          >
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
