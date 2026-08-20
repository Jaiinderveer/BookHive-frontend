import { useCallback, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import { getTransactions } from '../../services/transactionService.js'
import { getBooks } from '../../services/bookService.js'
import { getMembers } from '../../services/memberService.js'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import ResponsiveTable from '../../components/ui/ResponsiveTable.jsx'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateViews.jsx'
import StatusChip from '../../components/ui/StatusChip.jsx'
import { formatDate, formatDateTime, formatCurrency, isOverdue } from '../../utils/format.js'

export default function Transactions() {
  const txLoader = useCallback(() => getTransactions(), [])
  const { data: transactions, loading: txLoading, error: txError, reload } = useAsync(txLoader)
  const booksLoader = useCallback(() => getBooks(), [])
  const { data: books } = useAsync(booksLoader)
  const membersLoader = useCallback(() => getMembers(), [])
  const { data: members } = useAsync(membersLoader)

  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const hasActiveFilters = Boolean(search || statusFilter)

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('')
  }

  const rows = useMemo(() => {
    const bookMap = new Map((books || []).map((b) => [b.id, b]))
    const memberMap = new Map((members || []).map((m) => [m.id, m]))
    return (transactions || [])
      .map((t) => ({
        ...t,
        bookTitle: bookMap.get(t.book_id)?.title || 'Unknown book',
        memberName: memberMap.get(t.member_id)?.name || 'Unknown member',
        overdue: isOverdue(t.due_date, t.status),
      }))
      .filter((t) => {
        const q = search.trim().toLowerCase()
        const matchesSearch = !q || t.bookTitle.toLowerCase().includes(q) || t.memberName.toLowerCase().includes(q)
        const matchesStatus = !statusFilter || t.status === statusFilter
        return matchesSearch && matchesStatus
      })
  }, [transactions, books, members, search, statusFilter])

  const columns = [
    { id: 'book', label: 'Book', render: (t) => <Typography fontWeight={600} variant="body1">{t.bookTitle}</Typography> },
    { id: 'member', label: 'Member', render: (t) => <Typography color="text.secondary">{t.memberName}</Typography> },
    { id: 'issue', label: 'Issued', render: (t) => <Typography variant="body2" fontFamily="monospace" fontSize="0.8125rem">{formatDate(t.issue_date)}</Typography> },
    { id: 'due', label: 'Due', render: (t) => <Typography variant="body2" fontFamily="monospace" fontSize="0.8125rem">{formatDate(t.due_date)}</Typography> },
    { id: 'returned', label: 'Returned', render: (t) => (t.return_date ? <Typography variant="body2" fontFamily="monospace" fontSize="0.8125rem">{formatDate(t.return_date)}</Typography> : <Typography variant="body2" color="text.secondary">—</Typography>) },
    { id: 'fine', label: 'Fine', render: (t) => (t.fine > 0 ? <Typography color="error" fontWeight={600}>{formatCurrency(t.fine)}</Typography> : <Typography variant="body2" color="text.secondary">{formatCurrency(t.fine)}</Typography>) },
    { id: 'status', label: 'Status', render: (t) => <StatusChip status={t.status} overdue={t.overdue} /> },
  ]

  const renderCard = (t) => (
    <Card sx={{ height: '100%', transition: 'transform 0.2s ease, box-shadow 0.2s ease', '&:hover': { transform: 'translateY(-2px)' } }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Avatar
            sx={{ width: 48, height: 48, bgcolor: 'primary.light', color: 'primary.dark', flexShrink: 0 }}
          >
            <AssignmentTurnedInIcon fontSize="medium" />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom lineHeight={1.3}>
              {t.bookTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t.memberName}
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" mt={1} alignItems="center">
              <StatusChip status={t.status} overdue={t.overdue} />
              <Typography variant="caption" color="text.secondary">
                Issued {formatDateTime(t.issue_date)} • Due {formatDate(t.due_date)}
              </Typography>
            </Stack>
            {t.fine > 0 && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                Fine: {formatCurrency(t.fine)}
              </Typography>
            )}
            {t.return_date && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Returned {formatDate(t.return_date)}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
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
            Clear all filters
          </Button>
        )}
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          label="Search book or member"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />
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
      <PageHeader title="Transactions" subtitle="Record of all book issues and returns" />
      {filterBar}

      {txLoading ? (
        <LoadingState label="Loading transactions…" />
      ) : txError ? (
        <ErrorState message={getErrorMessage(txError)} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description={search || statusFilter ? 'Try adjusting your filters.' : 'Transactions will appear here once books are issued.'}
        />
      ) : (
        <ResponsiveTable columns={columns} rows={rows} getRowKey={(t) => t.id} renderCard={renderCard} />
      )}
    </Box>
  )
}
