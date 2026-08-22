import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import TuneIcon from '@mui/icons-material/Tune'
import CloseIcon from '@mui/icons-material/Close'

/*
 * Shared filter / search toolbar.
 *
 * Five pages previously hand-rolled the same "filter card": a heading, a row of
 * inputs and a conditional clear link. This owns that pattern so the label, the
 * active count and the clear affordance behave identically everywhere.
 *
 * `children` are laid out in a responsive grid; pass `columns` to control it.
 */
export default function FilterBar({
  children,
  onClear,
  activeCount = 0,
  title = 'Filters',
  columns = { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
  actions,
  dense = false,
}) {
  const hasActive = activeCount > 0
  // `columns={2}` is nicer to write at the call site than the CSS value.
  const gridTemplateColumns = typeof columns === 'number' ? `repeat(${columns}, minmax(0, 1fr))` : columns

  return (
    <Card sx={{ mb: 2.5, overflow: 'visible' }}>
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TuneIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 640 }}>
          {title}
        </Typography>
        {hasActive && (
          <Chip
            size="small"
            color="primary"
            label={`${activeCount} active`}
            sx={{ height: 20, fontSize: '0.6875rem' }}
          />
        )}
        <Box sx={{ flexGrow: 1 }} />
        {actions}
        {onClear && (
          <Button
            size="small"
            variant="text"
            color="inherit"
            onClick={onClear}
            disabled={!hasActive}
            startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
            sx={{ color: hasActive ? 'text.secondary' : 'text.disabled', px: 1 }}
          >
            Clear
          </Button>
        )}
      </Box>
      <Box
        sx={{
          p: dense ? 1.5 : 2,
          display: 'grid',
          gap: dense ? 1.25 : 1.75,
          gridTemplateColumns,
          alignItems: 'start',
        }}
      >
        {children}
      </Box>
    </Card>
  )
}
