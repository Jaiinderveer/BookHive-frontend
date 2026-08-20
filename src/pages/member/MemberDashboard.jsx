import { useCallback, useMemo } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import BookOutlinedIcon from '@mui/icons-material/BookOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import { getMyTransactions } from '../../services/transactionService.js'
import { getBooks } from '../../services/bookService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import { formatDate, formatCurrency, isOverdue } from '../../utils/format.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import StatusChip from '../../components/ui/StatusChip.jsx'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateViews.jsx'

export default function MemberDashboard() {
  const { user } = useAuth()
  const txLoader = useCallback(() => getMyTransactions(), [])
  const { data: myTx, loading: txLoading, error: txError, reload } = useAsync(txLoader)
  const booksLoader = useCallback(() => getBooks(), [])
  const { data: books, loading: booksLoading, error: booksError, reload: reloadBooks } = useAsync(booksLoader)

  const data = useMemo(() => {
    const bookMap = new Map((books || []).map((b) => [b.id, b]))
    const tx = (myTx || []).map((t) => ({
      ...t,
      bookTitle: bookMap.get(t.book_id)?.title || 'Unknown book',
      overdue: isOverdue(t.due_date, t.status),
    }))
    const issued = tx.filter((t) => t.status === 'Issued')
    const overdueCount = issued.filter((t) => t.overdue).length
    const totalFines = tx.reduce((sum, t) => sum + (Number(t.fine) || 0), 0)
    const availableCount = (books || []).filter((b) => b.available_quantity > 0).length
    return { tx, issued, overdueCount, totalFines, availableCount }
  }, [myTx, books])

  const loading = txLoading || booksLoading
  const error = txError || booksError

  return (
    <Box>
      <PageHeader
        title={`Welcome, ${user?.username || 'there'}`}
        subtitle="Here's your library at a glance"
      />

      {loading ? (
        <LoadingState label="Loading your dashboard…" />
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => { reload(); reloadBooks(); }} />
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <StatCard icon={BookOutlinedIcon} label="Currently borrowed" value={data.issued.length} color="warning" />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={WarningAmberOutlinedIcon} label="Overdue" value={data.overdueCount} color="error" />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={MenuBookOutlinedIcon} label="Books to browse" value={data.availableCount} color="primary" />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard icon={PaymentsOutlinedIcon} label="Total fines" value={formatCurrency(data.totalFines)} color="secondary" />
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Currently borrowed
              </Typography>
              {data.issued.length === 0 ? (
                <EmptyState
                  title="You have no books borrowed"
                  description="Browse the catalog to find your next read."
                />
              ) : (
                <Stack spacing={1.5}>
                  {data.issued.map((t) => (
                    <Box
                      key={t.id}
                      sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
                        <Box>
                          <Typography fontWeight={500}>{t.bookTitle}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Due {formatDate(t.due_date)}
                          </Typography>
                        </Box>
                        <StatusChip status={t.status} overdue={t.overdue} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}
