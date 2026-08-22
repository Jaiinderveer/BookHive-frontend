import { useCallback, useMemo } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { useNavigate } from 'react-router-dom'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import BookOutlinedIcon from '@mui/icons-material/BookOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { getMyTransactions } from '../../services/transactionService.js'
import { getBooks } from '../../services/bookService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import { formatDate, formatCurrency, isOverdue, istDateKey, parseBackendDate } from '../../utils/format.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import StatusChip from '../../components/ui/StatusChip.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import EntityCell from '../../components/ui/EntityCell.jsx'
import { ChartLegend, DonutChart, ProgressMeter } from '../../components/ui/Charts.jsx'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateViews.jsx'

// Whole IST calendar days until a loan is due; negative once it is overdue.
// Uses the same calendar-date rule as the backend's fine calculation.
function daysUntilDue(dueDate) {
  const due = parseBackendDate(dueDate)
  if (!due) return null
  const today = Date.parse(`${istDateKey(new Date())}T00:00:00Z`)
  const dueDay = Date.parse(`${istDateKey(due)}T00:00:00Z`)
  return Math.round((dueDay - today) / 86400000)
}

function DueChip({ days, overdue }) {
  if (overdue || (days !== null && days < 0)) {
    const late = days === null ? null : Math.abs(days)
    return <Chip size="small" color="error" label={late ? `${late} day${late === 1 ? '' : 's'} late` : 'Overdue'} />
  }
  if (days === null) return null
  if (days === 0) return <Chip size="small" color="warning" label="Due today" />
  if (days <= 3) return <Chip size="small" color="warning" label={`Due in ${days} day${days === 1 ? '' : 's'}`} />
  return <Chip size="small" variant="outlined" label={`Due in ${days} days`} />
}

export default function MemberDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const txLoader = useCallback(() => getMyTransactions(), [])
  const { data: myTx, loading: txLoading, error: txError, reload } = useAsync(txLoader)
  const booksLoader = useCallback(() => getBooks(), [])
  const { data: books, loading: booksLoading, error: booksError, reload: reloadBooks } = useAsync(booksLoader)

  const data = useMemo(() => {
    const bookMap = new Map((books || []).map((b) => [b.id, b]))
    const tx = (myTx || []).map((t) => {
      const book = bookMap.get(t.book_id)
      return {
        ...t,
        bookTitle: book?.title || 'Unknown book',
        bookAuthor: book?.author || '',
        overdue: isOverdue(t.due_date, t.status),
        daysLeft: daysUntilDue(t.due_date),
      }
    })
    const issued = tx
      .filter((t) => t.status === 'Issued')
      .sort((a, b) => (a.daysLeft ?? 9999) - (b.daysLeft ?? 9999))
    const returned = tx
      .filter((t) => t.status === 'Returned')
      .sort((a, b) => {
        const left = parseBackendDate(b.return_date)?.getTime() || 0
        const right = parseBackendDate(a.return_date)?.getTime() || 0
        return left - right
      })
    const overdueCount = issued.filter((t) => t.overdue).length
    const dueSoonCount = issued.filter((t) => !t.overdue && t.daysLeft !== null && t.daysLeft <= 3).length
    const totalFines = tx.reduce((sum, t) => sum + (Number(t.fine) || 0), 0)
    const availableCount = (books || []).filter((b) => b.available_quantity > 0).length
    return { tx, issued, returned, overdueCount, dueSoonCount, totalFines, availableCount }
  }, [myTx, books])

  const loading = txLoading || booksLoading
  const error = txError || booksError
  const retry = () => {
    reload()
    reloadBooks()
  }

  const composition = [
    { label: 'On loan now', value: data.issued.length, color: 'warning' },
    { label: 'Returned', value: data.returned.length, color: 'success' },
  ]

  return (
    <Box>
      <PageHeader
        title={`Welcome, ${user?.username || 'there'}`}
        subtitle="Your loans, due dates and reading history in one place."
        actions={
          <Button
            variant="contained"
            startIcon={<SearchOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate('/books')}
          >
            Browse catalogue
          </Button>
        }
      />

      {loading ? (
        <LoadingState label="Loading your dashboard…" />
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={retry} />
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid item xs={6} md={3}>
              <StatCard
                icon={BookOutlinedIcon}
                label="Currently borrowed"
                value={data.issued.length}
                color="warning"
                hint={data.dueSoonCount > 0 ? `${data.dueSoonCount} due within 3 days` : 'Nothing due soon'}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                icon={WarningAmberOutlinedIcon}
                label="Overdue"
                value={data.overdueCount}
                color="error"
                hint={data.overdueCount > 0 ? 'Please return these soon' : 'All loans on time'}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                icon={MenuBookOutlinedIcon}
                label="Books to browse"
                value={data.availableCount}
                color="primary"
                hint="Available to borrow now"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatCard
                icon={PaymentsOutlinedIcon}
                label="Total fines"
                value={formatCurrency(data.totalFines)}
                color="secondary"
                hint={data.totalFines > 0 ? 'Payable at the desk' : 'No fines outstanding'}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={7}>
              <SectionCard
                title="Currently borrowed"
                subtitle={
                  data.issued.length
                    ? `${data.issued.length} book${data.issued.length === 1 ? '' : 's'}, soonest due first`
                    : 'Nothing on loan'
                }
                icon={AutoStoriesOutlinedIcon}
                iconColor="warning"
                disableContentPadding={data.issued.length > 0}
                action={
                  <Button
                    size="small"
                    variant="text"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                    onClick={() => navigate('/my-books')}
                  >
                    My books
                  </Button>
                }
              >
                {data.issued.length === 0 ? (
                  <EmptyState
                    title="You have no books borrowed"
                    description="Browse the catalogue to find your next read."
                    icon={MenuBookOutlinedIcon}
                    action={
                      <Button variant="outlined" onClick={() => navigate('/books')}>
                        Browse catalogue
                      </Button>
                    }
                  />
                ) : (
                  <Box>
                    {data.issued.map((t, index) => (
                      <Box
                        key={t.id}
                        sx={{
                          px: 2.25,
                          py: 1.75,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          flexWrap: 'wrap',
                          borderBottom: index < data.issued.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                          transition: 'background-color 0.14s',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Box sx={{ minWidth: 220, flexGrow: 1 }}>
                          <EntityCell
                            icon={MenuBookOutlinedIcon}
                            color={t.overdue ? 'error' : 'primary'}
                            title={t.bookTitle}
                            subtitle={t.bookAuthor ? `${t.bookAuthor} · due ${formatDate(t.due_date)}` : `Due ${formatDate(t.due_date)}`}
                          />
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
                          <DueChip days={t.daysLeft} overdue={t.overdue} />
                          <StatusChip status={t.status} overdue={t.overdue} />
                        </Stack>
                      </Box>
                    ))}
                  </Box>
                )}
              </SectionCard>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Stack spacing={2.5}>
                <SectionCard
                  title="Borrowing summary"
                  subtitle="Across your whole history"
                  icon={DonutLargeOutlinedIcon}
                  iconColor="info"
                >
                  {data.tx.length === 0 ? (
                    <EmptyState
                      title="No borrowing history yet"
                      description="Your loans will be summarised here once you borrow your first book."
                      icon={DonutLargeOutlinedIcon}
                      compact
                      bordered={false}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                        justifyContent: 'center',
                      }}
                    >
                      <DonutChart
                        size={136}
                        thickness={14}
                        segments={composition}
                        centerValue={data.tx.length}
                        centerLabel="total loans"
                      />
                      <Box sx={{ minWidth: 0, flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}>
                        <ChartLegend segments={composition} />
                        <Divider sx={{ my: 1.75 }} />
                        <ProgressMeter
                          label="Returned on record"
                          value={data.returned.length}
                          max={data.tx.length || 1}
                          color="success"
                          valueLabel={`${data.returned.length}/${data.tx.length}`}
                        />
                      </Box>
                    </Box>
                  )}
                </SectionCard>

                <SectionCard
                  title="Recently returned"
                  icon={HistoryOutlinedIcon}
                  iconColor="success"
                  disableContentPadding={data.returned.length > 0}
                >
                  {data.returned.length === 0 ? (
                    <EmptyState
                      title="Nothing returned yet"
                      description="Books you return will be listed here."
                      icon={HistoryOutlinedIcon}
                      compact
                      bordered={false}
                    />
                  ) : (
                    <Box>
                      {data.returned.slice(0, 4).map((t, index, list) => (
                        <Box
                          key={t.id}
                          sx={{
                            px: 2.25,
                            py: 1.5,
                            borderBottom: index < list.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                          }}
                        >
                          <EntityCell
                            icon={MenuBookOutlinedIcon}
                            color="success"
                            size={30}
                            title={t.bookTitle}
                            subtitle={`Returned ${formatDate(t.return_date)}`}
                            trailing={
                              Number(t.fine) > 0 ? (
                                <Chip size="small" color="warning" label={formatCurrency(t.fine)} />
                              ) : null
                            }
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </SectionCard>
              </Stack>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}
