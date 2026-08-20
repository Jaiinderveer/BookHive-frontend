import { useCallback, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import { getTransactions, returnBook } from '../../services/transactionService.js'
import { getBooks } from '../../services/bookService.js'
import { getMembers } from '../../services/memberService.js'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import ResponsiveTable from '../../components/ui/ResponsiveTable.jsx'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateViews.jsx'
import StatusChip from '../../components/ui/StatusChip.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import { formatDate, isOverdue } from '../../utils/format.js'

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
  }, [transactions, books, members])

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

  const columns = [
    { id: 'book', label: 'Book', render: (t) => <Typography fontWeight={500}>{t.bookTitle}</Typography> },
    { id: 'member', label: 'Member', render: (t) => t.memberName },
    { id: 'issue', label: 'Issued', render: (t) => formatDate(t.issue_date) },
    { id: 'due', label: 'Due', render: (t) => formatDate(t.due_date) },
    { id: 'status', label: 'Status', render: (t) => <StatusChip status={t.status} overdue={t.overdue} /> },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (t) => (
        <Button size="small" variant="outlined" color="primary" onClick={() => setReturning(t)}>
          Return
        </Button>
      ),
    },
  ]

  const renderCard = (t) => (
    <Box>
      <Typography fontWeight={500}>{t.bookTitle}</Typography>
      <Typography variant="body2" color="text.secondary">{t.memberName} • due {formatDate(t.due_date)}</Typography>
      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <StatusChip status={t.status} overdue={t.overdue} />
        <Button size="small" variant="outlined" color="primary" onClick={() => setReturning(t)}>
          Return
        </Button>
      </Box>
    </Box>
  )

  const filterBar = (
    <Card sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentTurnedInIcon color="primary" sx={{ fontSize: 22 }} />
          Issued Books
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {issued.length} book{issued.length !== 1 ? 's' : ''} currently issued
        </Typography>
      </Box>
    </Card>
  )

  return (
    <Box>
      <PageHeader title="Return Book" subtitle="Process a book return" />
      <Divider sx={{ mb: 3 }} />
      {filterBar}

      {dataLoading ? (
        <LoadingState label="Loading issued books…" />
      ) : dataError ? (
        <ErrorState message={getErrorMessage(dataError)} onRetry={() => { reloadTx(); reloadBooks(); reloadMembers(); }} />
      ) : issued.length === 0 ? (
        <EmptyState title="Nothing to return" description="There are no books currently issued." />
      ) : (
        <ResponsiveTable columns={columns} rows={issued} getRowKey={(t) => t.id} renderCard={renderCard} />
      )}

      <ConfirmDialog
        open={Boolean(returning)}
        title="Return book?"
        message={returning ? `Confirm that "${returning.bookTitle}" is being returned by ${returning.memberName}.` : ''}
        confirmLabel="Return"
        onConfirm={handleConfirmReturn}
        onCancel={() => setReturning(null)}
        loading={returnLoading}
        danger={false}
      />

      <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack(null)} severity={snack?.severity || 'info'} sx={{ width: '100%' }}>{snack?.message}</Alert>
      </Snackbar>
    </Box>
  )
}
