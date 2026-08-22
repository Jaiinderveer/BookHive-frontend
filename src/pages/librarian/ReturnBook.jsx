import { useCallback, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

import AssignmentReturnedOutlinedIcon from '@mui/icons-material/AssignmentReturnedOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import SearchIcon from '@mui/icons-material/Search'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import OutboundOutlinedIcon from '@mui/icons-material/OutboundOutlined'
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined'

import { getTransactions, returnBook } from '../../services/transactionService.js'
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
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { formatDate, isOverdue, istDateKey, parseBackendDate, initials } from '../../utils/format.js'

export default function ReturnBook() {
  const txLoader = useCallback(() => getTransactions(), [])
  const { data: transactions, loading: txLoading, error: txError, reload: reloadTx } = useAsync(txLoader)
  const booksLoader = useCallback(() => getBooks(), [])
  const { data: books, loading: booksLoading, error: booksError, reload: reloadBooks } = useAsync(booksLoader)
  const membersLoader = useCallback(() => getMembers(), [])
  const { data: members, loading: membersLoading, error: membersError, reload: reloadMembers } = useAsync(membersLoader)

  const [returning, setReturning] = useState(null)
  const [returnLoading, setReturnLoading] = useState(false)
  const [snack, setSnack] = useState(null)
  const [search, setSearch] = useState('')

  const issued = useMemo(() => {
    const bookMap = new Map((books || []).map((b) => [b.id, b]))
    const memberMap = new Map((members || []).map((m) => [m.id, m]))
    return (transactions || [])
      .filter((t) => t.status === 'Issued')
      .map((t) => ({
        ...t,
        bookTitle: bookMap.get(t.book_id)?.title || 'Unknown book',
        memberName: memberMap.get(t.member_id)?.name || 'Unknown member',
        overdue: isOverdue(t.due_date, t.status),
      }))
      // Overdue first, then whatever is due soonest — the desk works top-down.
      .sort((a, b) => {
        if (a.overdue !== b.overdue) return a.overdue ? -1 : 1
        const left = parseBackendDate(a.due_date)?.getTime() ?? Number.MAX_SAFE_INTEGER
        const right = parseBackendDate(b.due_date)?.getTime() ?? Number.MAX_SAFE_INTEGER
        return left - right
      })
  }, [transactions, books, members])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return issued
    return issued.filter(
      (t) => t.bookTitle.toLowerCase().includes(q) || t.memberName.toLowerCase().includes(q),
    )
  }, [issued, search])

  const summary = useMemo(() => {
    const todayKey = istDateKey(new Date())
    return {
      overdue: issued.filter((t) => t.overdue).length,
      dueToday: issued.filter((t) => {
        const due = parseBackendDate(t.due_date)
        return due ? istDateKey(due) === todayKey : false
      }).length,
    }
  }, [issued])

  const handleConfirmReturn = async () => {
    if (!returning) return
    setReturnLoading(true)
    try {
      await returnBook({ transaction_id: returning.id })
      setSnack({ severity: 'success', message: `"${returning.bookTitle}" returned by ${returning.memberName}.` })
      setReturning(null)
      reloadTx()
    } catch (err) {
      setSnack({ severity: 'error', message: getErrorMessage(err) })
      setReturning(null)
    } finally {
      setReturnLoading(false)
    }
  }

  const dataError = txError || booksError || membersError
  const dataLoading = txLoading || booksLoading || membersLoading

  const returnButton = (t) => (
    <Button
      size="small"
      variant={t.overdue ? 'contained' : 'outlined'}
      color={t.overdue ? 'error' : 'primary'}
      startIcon={<AssignmentReturnedOutlinedIcon sx={{ fontSize: 16 }} />}
      onClick={() => setReturning(t)}
    >
      Return
    </Button>
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
        />
      ),
    },
    {
      id: 'member',
      label: 'Member',
      minWidth: 170,
      render: (t) => <EntityCell size={30} color="info" initials={initials(t.memberName)} title={t.memberName} />,
    },
    {
      id: 'issue',
      label: 'Issued',
      render: (t) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {formatDate(t.issue_date)}
        </Typography>
      ),
    },
    {
      id: 'due',
      label: 'Due',
      render: (t) => (
        <Typography
          variant="body2"
          noWrap
          sx={{ fontWeight: t.overdue ? 600 : 400, color: t.overdue ? 'error.main' : 'text.secondary' }}
        >
          {formatDate(t.due_date)}
        </Typography>
      ),
    },
    { id: 'status', label: 'Status', render: (t) => <StatusChip status={t.status} overdue={t.overdue} /> },
    { id: 'actions', label: '', align: 'right', width: 120, render: returnButton },
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
      />
      <Box
        sx={{
          mt: 1.75,
          pt: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box>
          <StatusChip status={t.status} overdue={t.overdue} />
          <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'text.secondary' }}>
            Issued {formatDate(t.issue_date)} · due {formatDate(t.due_date)}
          </Typography>
        </Box>
        {returnButton(t)}
      </Box>
    </Box>
  )

  return (
    <Box>
      <PageHeader
        title="Return book"
        subtitle="Process returns and clear overdue loans."
        icon={AssignmentReturnedOutlinedIcon}
        meta={
          !dataLoading && !dataError ? (
            <Chip
              size="small"
              variant="outlined"
              label={`${issued.length} ${issued.length === 1 ? 'loan' : 'loans'} open`}
            />
          ) : null
        }
      />

      {!dataLoading && !dataError && issued.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={12} sm={4}>
            <StatCard icon={OutboundOutlinedIcon} label="Open loans" value={issued.length} color="warning" />
          </Grid>
          <Grid item xs={6} sm={4}>
            <StatCard
              icon={WarningAmberOutlinedIcon}
              label="Overdue"
              value={summary.overdue}
              color="error"
              hint={summary.overdue > 0 ? 'Listed first below' : 'Nothing late'}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <StatCard icon={TodayOutlinedIcon} label="Due today" value={summary.dueToday} color="info" />
          </Grid>
        </Grid>
      )}

      {!dataLoading && !dataError && issued.length > 0 && (
        <FilterBar
          title="Find a loan"
          columns={1}
          activeCount={search ? 1 : 0}
          onClear={() => setSearch('')}
        >
          <TextField
            label="Search by book or member"
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
        </FilterBar>
      )}

      {dataLoading ? (
        <LoadingState label="Loading issued books…" />
      ) : dataError ? (
        <ErrorState
          message={getErrorMessage(dataError)}
          onRetry={() => {
            reloadTx()
            reloadBooks()
            reloadMembers()
          }}
        />
      ) : issued.length === 0 ? (
        <EmptyState
          title="Nothing to return"
          description="There are no books currently issued. Returns will appear here as soon as a copy goes out."
          icon={AssignmentReturnedOutlinedIcon}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No matching loan"
          description="No open loan matches that search."
          icon={SearchIcon}
          action={
            <Button variant="outlined" onClick={() => setSearch('')}>
              Clear search
            </Button>
          }
        />
      ) : (
        <ResponsiveTable
          columns={columns}
          rows={rows}
          getRowKey={(t) => t.id}
          renderCard={renderCard}
          footer={`${rows.length} ${rows.length === 1 ? 'loan' : 'loans'} shown`}
        />
      )}

      <ConfirmDialog
        open={Boolean(returning)}
        title="Return this book?"
        message={
          returning
            ? `Confirm that “${returning.bookTitle}” is being returned by ${returning.memberName}.${
                returning.overdue ? ' This loan is overdue, so a fine may be recorded.' : ''
              }`
            : ''
        }
        confirmLabel="Confirm return"
        onConfirm={handleConfirmReturn}
        onCancel={() => setReturning(null)}
        loading={returnLoading}
        danger={false}
      />

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnack(null)} severity={snack?.severity || 'info'} sx={{ width: '100%' }}>
          {snack?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
