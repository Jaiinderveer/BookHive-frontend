import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

/*
 * Avatar + primary line + secondary line.
 *
 * Books, members, transactions and the AI result cards all show this same
 * "who / what" pair; sharing it keeps the avatar size, truncation and type
 * weights identical in every table and card.
 */
export default function EntityCell({
  title,
  subtitle,
  initials,
  icon,
  color = 'primary',
  size = 34,
  variant = 'rounded',
  trailing,
  titleProps,
}) {
  const Icon = icon
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
      <Avatar
        variant={variant}
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          bgcolor: `${color}.light`,
          color: (t) => (t.palette.mode === 'light' ? `${color}.dark` : `${color}.main`),
          fontSize: size <= 30 ? '0.6875rem' : '0.75rem',
        }}
      >
        {Icon ? <Icon sx={{ fontSize: size * 0.5 }} /> : initials}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, lineHeight: 1.35, ...titleProps }}
          noWrap
          title={typeof title === 'string' ? title : undefined}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.35 }}
            noWrap
            title={typeof subtitle === 'string' ? subtitle : undefined}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {trailing && <Box sx={{ ml: 'auto', flexShrink: 0 }}>{trailing}</Box>}
    </Box>
  )
}
