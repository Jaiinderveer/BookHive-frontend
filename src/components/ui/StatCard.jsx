import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'

// Polished metric card used by the dashboards.
export default function StatCard({ icon, label, value, color = 'primary', loading = false, hint, trend }) {
  const Icon = icon
  return (
    <Card sx={{ height: '100%', transition: 'transform 0.2s ease, box-shadow 0.2s ease', '&:hover': { transform: 'translateY(-2px)' } }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: { xs: 2, sm: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}.light`,
              color: `${color}.dark`,
            }}
          >
            {Icon && <Icon fontSize="small" />}
          </Box>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Typography variant="caption" color={trend.positive ? 'success.main' : 'error.main'} sx={{ fontWeight: 600 }}>
                {trend.value}
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={60} height={36} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', mt: 0.5 }}>
              {value ?? '—'}
            </Typography>
          )}
          {hint && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {hint}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
