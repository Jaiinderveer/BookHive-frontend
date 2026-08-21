// Date/time formatting helpers shared across the app.
// Backend timestamps are stored in UTC. Convert to Asia/Kolkata (IST) for display.

const IST_TIMEZONE = 'Asia/Kolkata'

function parseBackendDate(value) {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'object' && value.$date) {
    return parseBackendDate(value.$date)
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return null
  }

  let normalized = String(value).trim()
  if (!normalized) return null

  // Some legacy backend responses contain naive ISO timestamps even though
  // they represent UTC. Explicitly mark those strings as UTC before parsing.
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized)
  if (!hasTimezone && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(normalized)) {
    normalized = normalized.replace(' ', 'T') + 'Z'
  }

  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value) {
  const date = parseBackendDate(value)
  if (!date) return '—'

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: IST_TIMEZONE,
  })
}

export function formatDateTime(value) {
  const date = parseBackendDate(value)
  if (!date) return '—'

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: IST_TIMEZONE,
  })
}

// True if the due date has passed for a still-issued transaction.
export function isOverdue(dueDateValue, status) {
  const due = parseBackendDate(dueDateValue)
  if (status !== 'Issued' || !due) return false
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
