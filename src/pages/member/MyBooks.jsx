import { useCallback, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined'
import OutboundOutlinedIcon from '@mui/icons-material/OutboundOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'

import { getMyTransactions } from '../../services/transactionService.js'
import { getBooks } from '../../services/bookService.js'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import ResponsiveTable from '../../components/ui/ResponsiveTable.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import EntityCell from '../../components/ui/EntityCell.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateViews.jsx'
import StatusChip from '../../components/ui/StatusChip.jsx'
import { formatDate, formatCurrency, isOverdue, istDateKey, parseBackendDate } from '../../utils/format.js'

// Whole-day difference on IST calendar dates, matching how the backend decides
// whether a loan is late. Returns null when the date cannot be parsed.
function daysUntilDue(dueDate) {
  const due = parseBackendDate(dueDate)
  if (!due) return null
  const dueKey = istDateKey(due)
  const todayKey = istDateKey(new Date())
  const diff = Date.parse(`${dueKey}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)
  return Math.round(diff / 86400000)
}

function DueText({ tx }) {
  const days = tx.status === 'Issued' ? daysUntilDue(tx.due_date) : null
  let hint = null
  if (days !== null) {
    if (days < 0) hint = `${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} late`
    else if (days === 0) hint = 'Due today'
    else hint = `in ${days} ${days === 1 ? 'day' : 'days'}`
  }
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="body2"
        noWrap
        sx={{ fontWeight: tx.overdue ? 600 : 400, color: tx.overdue ? 'error.main' : 'text.primary' }}
      >
        {formatDate(tx.due_date)}
      </Typography>
      {hint && (
        <Typography variant="caption" sx={{ color: tx.overdue ? 'error.main' : 'text.secondary' }}>
          {hint}
        </Typography>
      )}
    </Box>
  )
}

export default function MyBooks() {
  const txLoader = useCallback(() => getMyTransactions(), [])
  const { data: myTx, loading: txLoading, error: txError, reload } = useAsync(txLoader)
  const booksLoader = useCallback(() => getBooks(), [])
  const { data: books, loading: booksLoading, error: booksError, reload: reloadBooks } = useAsync(booksLoader)

  const [statusFilter, setStatusFilter] = useState('')
  const hasActiveFilters = Boolean(statusFilter)

  const handleClearFilters = () => {
    setStatusFilter('')
  }

  const enriched = useMemo(() => {
    const bookMap = new Map((books || []).map((b) => [b.id, b]))
    return (myTx || []).map((t) => {
      const book = bookMap.get(t.book_id)
      return {
        ...t,
        bookTitle: book?.title || 'Unknown book',
        bookAuthor: book?.author || '',
        overdue: isOverdue(t.due_date, t.status),
      }
    })
  }, [myTx, books])

  const rows = useMemo(
    () =>
      enriched.filter((t) => {
        if (!statusFilter) return true
        // "Overdue" is a view over issued loans, not a stored status.
        if (statusFilter === 'Overdue') return t.overdue
        return t.status === statusFilter
      }),
    [enriched, statusFilter],
  )

  const summary = useMemo(
    () => ({
      total: enriched.length,
      onLoan: enriched.filter((t) => t.status === 'Issued').length,
      overdue: enriched.filter((t) => t.overdue).length,
      fines: enriched.reduce((sum, t) => sum + (t.fine || 0), 0),
    }),
    [enriched],
  )

  const loading = txLoading || booksLoading
  const error = txError || booksError

  const columns = [
    {
      id: 'book',
      label: 'Book',
      minWidth: 230,
      render: (t) => (
        <EntityCell
          icon={MenuBookOutlinedIcon}
          color={t.overdue ? 'error' : 'primary'}
          title={t.bookTitle}
          subtitle={t.bookAuthor || undefined}
        />
      ),
    },
    {
      id: 'issued',
      label: 'Issued',
      render: (t) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {formatDate(t.issue_date)}
        </Typography>
      ),
    },
    { id: 'due', label: 'Due', minWidth: 130, render: (t) => <DueText tx={t} /> },
    {
      id: 'returned',
      label: 'Returned',
      render: (t) => (
        <Typography variant="body2" color={t.return_date ? 'text.secondary' : 'text.disabled'} noWrap>
          {t.return_date ? formatDate(t.return_date) : '—'}
        </Typography>
      ),
    },
    {
      id: 'fine',
      label: 'Fine',
      align: 'right',
      render: (t) => (
        <Typography
          variant="body2"
          className="tnum"
          sx={{ color: t.fine > 0 ? 'error.main' : 'text.disabled', fontWeight: t.fine > 0 ? 600 : 400 }}
        >
          {formatCurrency(t.fine)}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      align: 'right',
      render: (t) => <StatusChip status={t.status} overdue={t.overdue} />,
    },
  ]

  const renderCard = (t) => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <EntityCell
          icon={MenuBookOutlinedIcon}
          size={40}
          color={t.overdue ? 'error' : 'primary'}
          title={t.bookTitle}
          subtitle={t.bookAuthor || undefined}
          titleProps={{ fontSize: '0.9375rem' }}
        />
        <StatusChip status={t.status} overdue={t.overdue} />
      </Box>
      <Box
        sx={{
          mt: 1.75,
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          rowGap: 1.25,
          columnGap: 1.5,
        }}
      >
        <Box>
          <Typography variant="overline" sx={{ display: 'block', color: 'text.disabled' }}>
            Issued
          </Typography>
          <Typography variant="body2">{formatDate(t.issue_date)}</Typography>
        </Box>
        <Box>
          <Typography variant="overline" sx={{ display: 'block', color: 'text.disabled' }}>
            {t.return_date ? 'Returned' : 'Due'}
          </Typography>
          {t.return_date ? (
            <Typography variant="body2">{formatDate(t.return_date)}</Typography>
          ) : (
            <DueText tx={t} />
          )}
        </Box>
        {t.fine > 0 && (
          <Box>
            <Typography variant="overline" sx={{ display: 'block', color: 'text.disabled' }}>
              Fine
            </Typography>
            <Typography variant="body2" className="tnum" sx={{ color: 'error.main', fontWeight: 600 }}>
              {formatCurrency(t.fine)}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )

  return (
    <Box>
      <PageHeader
        title="My books"
        subtitle="Everything you have borrowed, with due dates and fines."
        icon={CollectionsBookmarkOutlinedIcon}
        meta={
          !loading && !error && summary.total > 0 ? (
            <>
              <Chip
                size="small"
                variant="outlined"
                label={`${summary.total} ${summary.total === 1 ? 'loan' : 'loans'} on record`}
              />
              {summary.overdue > 0 && <Chip size="small" color="error" label={`${summary.overdue} overdue`} />}
            </>
          ) : null
        }
      />

      {!loading && !error && summary.total > 0 && (
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={6} md={4}>
            <StatCard
              icon={OutboundOutlinedIcon}
              label="Currently borrowed"
              value={summary.onLoan}
              color="primary"
              hint={summary.onLoan === 0 ? 'Nothing out right now' : 'Return before the due date'}
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <StatCard
              icon={WarningAmberOutlinedIcon}
              label="Overdue"
              value={summary.overdue}
              color="error"
              hint={summary.overdue > 0 ? 'Please return these first' : 'All on time'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              icon={PaymentsOutlinedIcon}
              label="Fines recorded"
              value={formatCurrency(summary.fines)}
              color="warning"
            />
          </Grid>
        </Grid>
      )}

      {!loading && !error && summary.total > 0 && (
        <FilterBar
          title="Filter loans"
          columns={1}
          activeCount={hasActiveFilters ? 1 : 0}
          onClear={handleClearFilters}
        >
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            fullWidth
          >
            <MenuItem value="">All loans</MenuItem>
            <MenuItem value="Issued">Currently borrowed</MenuItem>
            <MenuItem value="Returned">Returned</MenuItem>
            <MenuItem value="Overdue">Overdue only</MenuItem>
          </TextField>
        </FilterBar>
      )}

      {loading ? (
        <LoadingState label="Loading your books…" />
      ) : error ? (
        <ErrorState
          message={getErrorMessage(error)}
          onRetry={() => {
            reload()
            reloadBooks()
          }}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No loans match that filter' : 'No books here yet'}
          description={
            hasActiveFilters
              ? 'Try a different status filter to see the rest of your history.'
              : 'Borrow a book from the catalogue and it will appear here with its due date.'
          }
          icon={CollectionsBookmarkOutlinedIcon}
          action={
            hasActiveFilters ? (
              <Button variant="outlined" onClick={handleClearFilters}>
                Clear filter
              </Button>
            ) : null
          }
        />
      ) : (
        <ResponsiveTable
          columns={columns}
          rows={rows}
          getRowKey={(t) => t.id}
          renderCard={renderCard}
          footer={`${rows.length} of ${summary.total} ${summary.total === 1 ? 'loan' : 'loans'} shown`}
        />
      )}
    </Box>
  )
}
