import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'

/*
 * Full-page message (404, 403, and anything else that replaces the whole app
 * shell). Both status pages previously repeated the same centred stack; this
 * owns the framing so they stay consistent with cards elsewhere.
 */
export default function MessagePage({
  icon: Icon,
  iconColor = 'info',
  code,
  title,
  description,
  actions,
  footer,
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
        bgcolor: 'background.sunken',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 460 }}>
        <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          {Icon && (
            <Box
              sx={{
                width: 52,
                height: 52,
                mx: 'auto',
                mb: 2.5,
                borderRadius: 2.5,
                bgcolor: `${iconColor}.light`,
                color: (t) => (t.palette.mode === 'light' ? `${iconColor}.dark` : `${iconColor}.main`),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon sx={{ fontSize: 25 }} />
            </Box>
          )}

          {code && (
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                mb: 0.5,
                color: 'text.disabled',
                fontFamily: (t) => t.typography.fontFamilyMonospace,
                letterSpacing: '0.12em',
              }}
            >
              Error {code}
            </Typography>
          )}

          <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
            {title}
          </Typography>

          {description && (
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 380, mx: 'auto' }}>
              {description}
            </Typography>
          )}

          {actions && (
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1.25,
                justifyContent: 'center',
              }}
            >
              {actions}
            </Box>
          )}
        </Box>

        {footer && (
          <Box
            sx={{
              px: 3,
              py: 1.75,
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.subtle',
              textAlign: 'center',
            }}
          >
            {footer}
          </Box>
        )}
      </Card>
    </Box>
  )
}
