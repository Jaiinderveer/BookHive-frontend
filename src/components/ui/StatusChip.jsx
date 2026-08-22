import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

// A small filled dot; carries the status colour so the chip itself can stay
// low-contrast and the row does not turn into a block of colour.
function Dot({ color }) {
  return (
    <Box
      component="span"
      sx={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        bgcolor: color,
        flexShrink: 0,
        ml: 0.75,
        mr: -0.25,
      }}
    />
  )
}

// Renders transaction / availability status as a colored chip.
// statuses seen from the backend: "Issued", "Returned".
export default function StatusChip({ status, overdue = false, size = 'small' }) {
  if (overdue) {
    return <Chip size={size} color="error" label="Overdue" icon={<Dot color="error.main" />} />
  }
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'issued') {
    return <Chip size={size} color="warning" label="Issued" icon={<Dot color="warning.main" />} />
  }
  if (normalized === 'returned') {
    return <Chip size={size} color="success" label="Returned" icon={<Dot color="success.main" />} />
  }
  return <Chip size={size} variant="outlined" label={status || '—'} />
}
