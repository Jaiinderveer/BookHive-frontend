import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'

/*
 * Titled panel used for every dashboard block and page section.
 *
 * One component owns the header rhythm (title / subtitle / action), the padding
 * and the optional footer, so panels across the app line up instead of each
 * page inventing its own Card header.
 */
export default function SectionCard({
  title,
  subtitle,
  icon,
  iconColor = 'primary',
  action,
  children,
  footer,
  padding = 2.25,
  disableContentPadding = false,
  sx,
  ...rest
}) {
  const Icon = icon
  const hasHeader = Boolean(title || subtitle || action)

  return (
    <Card
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', ...sx }}
      {...rest}
    >
      {hasHeader && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: padding,
            py: 1.75,
            borderBottom: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          {Icon && (
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.5,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${iconColor}.light`,
                color: (t) => (t.palette.mode === 'light' ? `${iconColor}.dark` : `${iconColor}.main`),
              }}
            >
              <Icon sx={{ fontSize: 17 }} />
            </Box>
          )}
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            {title && (
              <Typography variant="h6" component="h2" sx={{ fontSize: '0.9375rem', lineHeight: 1.35 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary" component="div" sx={{ lineHeight: 1.4 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box sx={{ flexShrink: 0, display: 'flex', gap: 0.75, alignItems: 'center' }}>{action}</Box>}
        </Box>
      )}

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          ...(disableContentPadding ? {} : { p: padding }),
        }}
      >
        {children}
      </Box>

      {footer && (
        <Box
          sx={{
            px: padding,
            py: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.subtle',
            flexShrink: 0,
          }}
        >
          {footer}
        </Box>
      )}
    </Card>
  )
}
