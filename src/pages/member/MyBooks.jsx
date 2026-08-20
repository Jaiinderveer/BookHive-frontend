import { useCallback, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import { getMyTransactions } from '../../services/transactionService.js'
import { getBooks } from '../../services/bookService.js'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import ResponsiveTable from '../../components/ui/ResponsiveTable.jsx'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateViews.jsx'
import StatusChip from '../../components/ui/StatusChip.jsx'
import { formatDate, formatCurrency, isOverdue } from '../../utils/format.js'

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

  const rows = useMemo(() => {
    const bookMap = new Map((books || []).map((b) => [b.id, b]))
    return (myTx || [])
      .map((t) => ({
        ...t,
        bookTitle: bookMap.get(t.book_id)?.title || 'Unknown book',
        overdue: isOverdue(t.due_date, t.status),
      }))
      .filter((t) => !statusFilter || t.status === statusFilter)
  }, [myTx, books, statusFilter])

  const loading = txLoading || booksLoading
  const error = txError || booksError

  const columns = [
    { id: 'book', label: 'Book', render: (t) => <Typography fontWeight={500}>{t.bookTitle}</Typography> },
    { id: 'issued', label: 'Issued', render: (t) => formatDate(t.issue_date) },
    { id: 'due', label: 'Due', render: (t) => formatDate(t.due_date) },
    { id: 'returned', label: 'Returned', render: (t) => (t.return_date ? formatDate(t.return_date) : '—') },
    { id: 'fine', label: 'Fine', render: (t) => (t.fine > 0 ? <Typography color="error">{formatCurrency(t.fine)}</Typography> : formatCurrency(t.fine)) },
    { id: 'status', label: 'Status', render: (t) => <StatusChip status={t.status} overdue={t.overdue} /> },
  ]

  const renderCard = (t) => (
    <Box>
      <Typography fontWeight={500}>{t.bookTitle}</Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <StatusChip status={t.status} overdue={t.overdue} />
        <Typography variant="caption" color="text.secondary">
          Issued {formatDate(t.issue_date)} • Due {formatDate(t.due_date)}
        </Typography>
      </Stack>
      {t.fine > 0 && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          Fine: {formatCurrency(t.fine)}
        </Typography>
      )}
    </Box>
  )

  const filterBar = (
    <Card sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="primary" sx={{ fontSize: 22 }} />
          Filters
        </Typography>
        {hasActiveFilters && (
          <Button variant="text" startIcon={<ClearIcon />} size="small" onClick={handleClearFilters} color="secondary">
            Clear filter
          </Button>
        )}
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          select
          label="Status"
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: { sm: 160 } }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Issued">Issued</MenuItem>
          <MenuItem value="Returned">Returned</MenuItem>
        </TextField>
      </Stack>
    </Card>
  )

  return (
    <Box>
      <PageHeader title="My Books" subtitle="Books you have borrowed" />
      {filterBar}

      {loading ? (
        <LoadingState label="Loading your books…" />
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => { reload(); reloadBooks(); }} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No books here yet"
          description={statusFilter ? 'Try a different status filter.' : 'Borrow a book from the catalog and it will appear here.'}
        />
      ) : (
        <ResponsiveTable columns={columns} rows={rows} getRowKey={(t) => t.id} renderCard={renderCard} />
      )}
    </Box>
  )
}
