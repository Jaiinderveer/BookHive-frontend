// Date/time formatting helpers shared across the app.

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// True if the due date has passed for a still-issued transaction.
export function isOverdue(dueDateValue, status) {
  if (status !== 'Issued') return false
  if (!dueDateValue) return false
  const due = new Date(dueDateValue)
  if (Number.isNaN(due.getTime())) return false
  return due.getTime() < Date.now()
}

export function formatCurrency(value) {
  const amount = Number(value) || 0
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function initials(name = '') {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}
