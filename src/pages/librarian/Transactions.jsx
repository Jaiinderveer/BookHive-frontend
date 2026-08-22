import { useCallback, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'

import SearchIcon from '@mui/icons-material/Search'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import OutboundOutlinedIcon from '@mui/icons-material/OutboundOutlined'
import AssignmentReturnedOutlinedIcon from '@mui/icons-material/AssignmentReturnedOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'

import { getTransactions } from '../../services/transactionService.js'
import { getBooks } from '../../services/bookService.js'
import { getMembers } from '../../services/memberService.js'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import ResponsiveTable from '../../components/ui/ResponsiveTable.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import EntityCell from '../../components/ui/EntityCell.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateViews.jsx'
import StatusChip from '../../components/ui/StatusChip.jsx'
import { formatDate, formatDateTime, formatCurrency, isOverdue, initials } from '../../utils/format.js'

// Dates line up column-to-column when they share the tabular monospace face.
function DateText({ value, muted }) {
  return (
    <Typography
      variant="body2"
      sx={{
        fontFamily: (t) => t.typography.fontFamilyMonospace,
        fontSize: '0.8125rem',
        color: muted ? 'text.disabled' : 'text.secondary',
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </Typography>
  )
}

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
  const activeFilterCount = (search ? 1 : 0) + (statusFilter ? 1 : 0)

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('')
  }

  const enriched = useMemo(() => {
    const bookMap = new Map((books || []).map((b) => [b.id, b]))
    const memberMap = new Map((members || []).map((m) => [m.id, m]))
    return (transactions || []).map((t) => ({
      ...t,
      bookTitle: bookMap.get(t.book_id)?.title || 'Unknown book',
      bookAuthor: bookMap.get(t.book_id)?.author || '',
      memberName: memberMap.get(t.member_id)?.name || 'Unknown member',
      overdue: isOverdue(t.due_date, t.status),
    }))
  }, [transactions, books, members])

  const rows = useMemo(
    () =>
      enriched.filter((t) => {
        const q = search.trim().toLowerCase()
        const matchesSearch = !q || t.bookTitle.toLowerCase().includes(q) || t.memberName.toLowerCase().includes(q)
        const matchesStatus =
          !statusFilter || (statusFilter === 'Overdue' ? t.overdue : t.status === statusFilter)
        return matchesSearch && matchesStatus
      }),
    [enriched, search, statusFilter],
  )

  const summary = useMemo(
    () => ({
      issued: enriched.filter((t) => t.status === 'Issued').length,
      returned: enriched.filter((t) => t.status === 'Returned').length,
      overdue: enriched.filter((t) => t.overdue).length,
      fines: enriched.reduce((sum, t) => sum + (Number(t.fine) || 0), 0),
    }),
    [enriched],
  )

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
      id: 'member',
      label: 'Member',
      minWidth: 170,
      render: (t) => <EntityCell size={30} initials={initials(t.memberName)} color="info" title={t.memberName} />,
    },
    { id: 'issue', label: 'Issued', render: (t) => <DateText value={formatDate(t.issue_date)} /> },
    { id: 'due', label: 'Due', render: (t) => <DateText value={formatDate(t.due_date)} /> },
    {
      id: 'returned',
      label: 'Returned',
      render: (t) => <DateText value={t.return_date ? formatDate(t.return_date) : '—'} muted={!t.return_date} />,
    },
    {
      id: 'fine',
      label: 'Fine',
      align: 'right',
      render: (t) =>
        t.fine > 0 ? (
          <Typography variant="body2" className="tnum" sx={{ color: 'error.main', fontWeight: 600 }}>
            {formatCurrency(t.fine)}
          </Typography>
        ) : (
          <Typography variant="body2" className="tnum" color="text.disabled">
            {formatCurrency(0)}
          </Typography>
        ),
    },
    {
      id: 'status',
      label: 'Status',
      align: 'right',
      width: 120,
      render: (t) => <StatusChip status={t.status} overdue={t.overdue} />,
    },
  ]

  const renderCard = (t) => (
    <Box>
      <EntityCell
        icon={MenuBookOutlinedIcon}
        size={40}
        color={t.overdue ? 'error' : 'primary'}
        title={t.bookTitle}
        subtitle={t.memberName}
        titleProps={{ fontSize: '0.9375rem' }}
        trailing={<StatusChip status={t.status} overdue={t.overdue} />}
      />

      <Box
        sx={{
          mt: 1.75,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1.25,
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="overline" sx={{ color: 'text.disabled', display: 'block' }}>
            Issued
          </Typography>
          <DateText value={formatDateTime(t.issue_date)} />
        </Box>
        <Box>
          <Typography variant="overline" sx={{ color: 'text.disabled', display: 'block' }}>
            Due
          </Typography>
          <DateText value={formatDate(t.due_date)} />
        </Box>
        {t.return_date && (
          <Box>
            <Typography variant="overline" sx={{ color: 'text.disabled', display: 'block' }}>
              Returned
            </Typography>
            <DateText value={formatDate(t.return_date)} />
          </Box>
        )}
        {t.fine > 0 && (
          <Box>
            <Typography variant="overline" sx={{ color: 'text.disabled', display: 'block' }}>
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
        title="Transactions"
        subtitle="Every issue and return, with due dates and fines."
        icon={SwapHorizOutlinedIcon}
        meta={
          transactions && !txLoading && !txError ? (
            <Chip
              size="small"
              variant="outlined"
              label={`${rows.length} of ${enriched.length} ${enriched.length === 1 ? 'record' : 'records'}`}
            />
          ) : null
        }
      />

      {!txLoading && !txError && enriched.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={6} md={3}>
            <StatCard icon={OutboundOutlinedIcon} label="On loan" value={summary.issued} color="warning" />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard
              icon={WarningAmberOutlinedIcon}
              label="Overdue"
              value={summary.overdue}
              color="error"
              hint={summary.overdue > 0 ? 'Needs follow-up' : 'All loans on time'}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard icon={AssignmentReturnedOutlinedIcon} label="Returned" value={summary.returned} color="success" />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard
              icon={PaymentsOutlinedIcon}
              label="Fines recorded"
              value={formatCurrency(summary.fines)}
              color="secondary"
            />
          </Grid>
        </Grid>
      )}

      <FilterBar activeCount={activeFilterCount} onClear={handleClearFilters} columns={2}>
        <TextField
          label="Search book or member"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} fullWidth>
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="Issued">Issued</MenuItem>
          <MenuItem value="Returned">Returned</MenuItem>
          <MenuItem value="Overdue">Overdue only</MenuItem>
        </TextField>
      </FilterBar>

      {txLoading ? (
        <LoadingState label="Loading transactions…" />
      ) : txError ? (
        <ErrorState message={getErrorMessage(txError)} onRetry={reload} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description={
            hasActiveFilters
              ? 'No record matches these filters. Try a different search or status.'
              : 'Transactions will appear here once books are issued.'
          }
          icon={SwapHorizOutlinedIcon}
          action={
            hasActiveFilters ? (
              <Button variant="outlined" onClick={handleClearFilters}>
                Clear filters
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
          footer={`${rows.length} ${rows.length === 1 ? 'record' : 'records'} shown`}
        />
      )}
    </Box>
  )
}
