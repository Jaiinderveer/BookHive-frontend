// Date/time formatting helpers shared across the app.
// Backend timestamps are stored in UTC. Convert to Asia/Kolkata (IST) for display.

const IST_TIMEZONE = 'Asia/Kolkata'

export function parseBackendDate(value) {
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

// Sortable YYYY-MM-DD key for an instant, as seen on the IST calendar.
// formatToParts is used instead of a formatted string so the result never
// depends on the viewer's locale.
const IST_DATE_PARTS = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: IST_TIMEZONE,
})

export function istDateKey(date) {
  const parts = {}
  for (const part of IST_DATE_PARTS.formatToParts(date)) {
    parts[part.type] = part.value
  }
  return `${parts.year}-${parts.month}-${parts.day}`
}

// True if a still-issued transaction is past due.
// This mirrors the backend rule exactly: a book becomes overdue only once the
// current IST calendar date is AFTER the due date's IST calendar date, so a
// book due today is not overdue and carries no fine. Comparing instants here
// would disagree with the fine the backend sends alongside it.
export function isOverdue(dueDateValue, status) {
  const due = parseBackendDate(dueDateValue)
  if (status !== 'Issued' || !due) return false
  return istDateKey(new Date()) > istDateKey(due)
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

// Clock time only (IST) — used where the date is already implied by grouping.
export function formatTime(value) {
  const date = parseBackendDate(value)
  if (!date) return '—'

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: IST_TIMEZONE,
  })
}

// Short "how long ago" label for activity feeds. Falls back to the absolute
// date once an entry is old enough that a relative label stops being useful.
export function formatRelativeTime(value) {
  const date = parseBackendDate(value)
  if (!date) return '—'

  const seconds = Math.round((Date.now() - date.getTime()) / 1000)
  if (seconds < 45) return 'just now'
  if (seconds < 90) return '1 min ago'

  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`

  const days = Math.round(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`

  return formatDate(date)
}

// Weekday abbreviation for an instant, on the IST calendar.
const IST_WEEKDAY = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  timeZone: IST_TIMEZONE,
})

export function istWeekdayLabel(date) {
  return IST_WEEKDAY.format(date)
}
