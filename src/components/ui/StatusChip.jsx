import Chip from '@mui/material/Chip'

// Renders transaction / availability status as a colored chip.
// statuses seen from the backend: "Issued", "Returned".
export default function StatusChip({ status, overdue = false }) {
  if (overdue) {
    return <Chip size="small" color="error" label="Overdue" variant="outlined" />
  }
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'issued') {
    return <Chip size="small" color="warning" label="Issued" />
  }
  if (normalized === 'returned') {
    return <Chip size="small" color="success" label="Returned" />
  }
  return <Chip size="small" variant="outlined" label={status || '—'} />
}
