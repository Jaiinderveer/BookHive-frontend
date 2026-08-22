import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { useNavigate } from 'react-router-dom'

import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined'
import AssignmentReturnedOutlinedIcon from '@mui/icons-material/AssignmentReturnedOutlined'
import LibraryAddOutlinedIcon from '@mui/icons-material/LibraryAddOutlined'
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'

import { useAsync } from '../../hooks/useAsync.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { getDashboard } from '../../services/dashboardService.js'
import { formatRelativeTime, istDateKey, istWeekdayLabel, parseBackendDate } from '../../utils/format.js'

import { LoadingState, ErrorState, EmptyState } from '../../components/ui/StateViews.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import { BarSeries, ChartLegend, DonutChart, ProgressMeter, StackedBar } from '../../components/ui/Charts.jsx'

const STATS = [
  { key: 'total_books', label: 'Total Books', icon: MenuBookOutlinedIcon, color: 'primary' },
  { key: 'books_available', label: 'Available', icon: CheckCircleOutlineIcon, color: 'success' },
  { key: 'books_issued', label: 'Issued', icon: SwapHorizOutlinedIcon, color: 'warning' },
  { key: 'total_members', label: 'Total Members', icon: GroupOutlinedIcon, color: 'info' },
  { key: 'overdue_books', label: 'Overdue', icon: WarningAmberOutlinedIcon, color: 'error' },
  { key: 'today_transactions', label: "Today's Activity", icon: TodayOutlinedIcon, color: 'secondary' },
]

const QUICK_ACTIONS = [
  { label: 'Issue a book', hint: 'Lend to a member', path: '/issue', icon: SwapHorizOutlinedIcon, color: 'primary' },
  { label: 'Return a book', hint: 'Close a loan', path: '/return', icon: AssignmentReturnedOutlinedIcon, color: 'success' },
  { label: 'Add to catalogue', hint: 'New title', path: '/books', icon: LibraryAddOutlinedIcon, color: 'info' },
  { label: 'Manage members', hint: 'Accounts & access', path: '/members', icon: PersonAddAltOutlinedIcon, color: 'secondary' },
]

// Classify a free-text activity type into an icon + tone so the feed can be
// scanned without reading every line.
function activityAppearance(type) {
  const value = String(type || '').toLowerCase()
  if (value.includes('overdue')) return { icon: WarningAmberOutlinedIcon, color: 'error' }
  if (value.includes('return')) return { icon: AssignmentReturnedOutlinedIcon, color: 'success' }
  if (value.includes('issue') || value.includes('borrow')) return { icon: SwapHorizOutlinedIcon, color: 'warning' }
  if (value.includes('member') || value.includes('user')) return { icon: GroupOutlinedIcon, color: 'info' }
  if (value.includes('book') || value.includes('catalog')) return { icon: MenuBookOutlinedIcon, color: 'primary' }
  return { icon: HistoryOutlinedIcon, color: 'primary' }
}

// The trailing seven IST calendar days, oldest first. Kept outside the component
// so reading the clock stays out of render.
function buildWeekWindow() {
  const now = Date.now()
  const days = []
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now - offset * 86400000)
    days.push({ key: istDateKey(date), label: offset === 0 ? 'Today' : istWeekdayLabel(date), value: 0 })
  }
  return days
}

export default function LibrarianDashboard() {
  const { data, loading, error, reload } = useAsync(getDashboard)
  const navigate = useNavigate()
  const { user } = useAuth()

  const activities = useMemo(() => (Array.isArray(data?.activities) ? data.activities : []), [data])

  // Derived views over the payload the dashboard endpoint already returns —
  // no extra requests are made.
  const summary = useMemo(() => {
    const available = Number(data?.books_available) || 0
    const issued = Number(data?.books_issued) || 0
    const overdue = Number(data?.overdue_books) || 0
    const totalCopies = available + issued

    // Events per day over the last week, on the IST calendar.
    const days = buildWeekWindow()
    const dayIndex = new Map(days.map((day, index) => [day.key, index]))

    let issues = 0
    let returns = 0
    let other = 0
    for (const activity of activities) {
      const date = parseBackendDate(activity?.timestamp)
      if (date) {
        const index = dayIndex.get(istDateKey(date))
        if (index !== undefined) days[index].value += 1
      }
      const type = String(activity?.type || '').toLowerCase()
      if (type.includes('return')) returns += 1
      else if (type.includes('issue') || type.includes('borrow')) issues += 1
      else other += 1
    }

    return {
      available,
      issued,
      overdue,
      totalCopies,
      utilisation: totalCopies > 0 ? Math.round((issued / totalCopies) * 100) : 0,
      days,
      mix: [
        { label: 'Issues', value: issues, color: 'warning' },
        { label: 'Returns', value: returns, color: 'success' },
        { label: 'Other', value: other, color: 'info' },
      ].filter((segment) => segment.value > 0),
      trackedEvents: activities.length,
    }
  }, [data, activities])

  const hint = (key) => {
    if (!data) return undefined
    if (key === 'books_available' && summary.totalCopies > 0) {
      return `${100 - summary.utilisation}% of copies on the shelf`
    }
    if (key === 'books_issued' && summary.totalCopies > 0) {
      return `${summary.utilisation}% of copies on loan`
    }
    if (key === 'overdue_books') {
      return summary.overdue > 0 ? 'Needs follow-up' : 'Nothing overdue'
    }
    return undefined
  }

  return (
    <Box>
      <PageHeader
        title={user?.username ? `Welcome back, ${user.username}` : 'Library overview'}
        subtitle="A live view of circulation, collection health and member activity."
        actions={
          <>
            <Tooltip title="Refresh data">
              <IconButton onClick={reload} aria-label="Refresh dashboard" sx={{ color: 'text.secondary' }}>
                <RefreshIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 17 }} />}
              onClick={() => navigate('/ai')}
            >
              Ask AI
            </Button>
            <Button
              variant="contained"
              startIcon={<SwapHorizOutlinedIcon sx={{ fontSize: 18 }} />}
              onClick={() => navigate('/issue')}
            >
              Issue book
            </Button>
          </>
        }
      />

      {loading ? (
        <LoadingState label="Loading dashboard…" />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={reload} />
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            {STATS.map((stat) => (
              <Grid item xs={6} sm={4} lg={2} key={stat.key}>
                <StatCard
                  icon={stat.icon}
                  label={stat.label}
                  value={data ? data[stat.key] : null}
                  color={stat.color}
                  hint={hint(stat.key)}
                />
              </Grid>
            ))}
          </Grid>

          {summary.overdue > 0 && (
            <Box
              sx={{
                mb: 2.5,
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: (t) =>
                  t.palette.mode === 'light' ? 'rgba(192, 54, 44, 0.22)' : 'rgba(240, 131, 121, 0.26)',
                bgcolor: 'error.light',
                display: 'flex',
                alignItems: 'center',
                gap: 1.75,
                flexWrap: 'wrap',
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  flexShrink: 0,
                  bgcolor: 'background.paper',
                  color: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WarningAmberOutlinedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 660, color: (t) => (t.palette.mode === 'light' ? 'error.dark' : 'error.main') }}
                >
                  {summary.overdue} {summary.overdue === 1 ? 'loan is' : 'loans are'} past their due date
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: (t) => (t.palette.mode === 'light' ? 'error.dark' : 'error.main'),
                    opacity: 0.85,
                  }}
                >
                  Review them in Transactions to follow up with members and record fines.
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                color="error"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate('/transactions')}
                sx={{ bgcolor: 'background.paper', flexShrink: 0 }}
              >
                Review overdue
              </Button>
            </Box>
          )}

          <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
            <Grid item xs={12} lg={7}>
              <SectionCard
                title="Circulation activity"
                subtitle={
                  summary.trackedEvents > 0
                    ? `Events per day (IST) across the ${summary.trackedEvents} most recent records`
                    : 'Events per day (IST)'
                }
                icon={InsightsOutlinedIcon}
                action={
                  <Chip
                    size="small"
                    label={`${data?.today_transactions ?? 0} today`}
                    color={Number(data?.today_transactions) > 0 ? 'primary' : 'default'}
                  />
                }
                footer={
                  summary.mix.length > 0 ? (
                    <Box>
                      <StackedBar segments={summary.mix} />
                      <Stack direction="row" spacing={2} sx={{ mt: 1.25, flexWrap: 'wrap' }}>
                        {summary.mix.map((segment) => (
                          <Box key={segment.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '2px',
                                bgcolor: `${segment.color}.main`,
                              }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {segment.label}
                            </Typography>
                            <Typography className="tnum" variant="caption" sx={{ fontWeight: 650 }}>
                              {segment.value}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No recorded events yet.
                    </Typography>
                  )
                }
              >
                <BarSeries data={summary.days} height={160} color="primary" />
              </SectionCard>
            </Grid>

            <Grid item xs={12} lg={5}>
              <SectionCard
                title="Collection status"
                subtitle="Where every copy currently sits"
                icon={DonutLargeOutlinedIcon}
                iconColor="success"
              >
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
                    size={148}
                    thickness={15}
                    segments={[
                      { label: 'Available', value: summary.available, color: 'success' },
                      { label: 'On loan', value: summary.issued, color: 'warning' },
                    ]}
                    centerValue={summary.totalCopies}
                    centerLabel="copies tracked"
                  />
                  <Box sx={{ minWidth: 0, flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}>
                    <ChartLegend
                      segments={[
                        { label: 'Available', value: summary.available, color: 'success' },
                        { label: 'On loan', value: summary.issued, color: 'warning' },
                      ]}
                    />
                    <Divider sx={{ my: 1.75 }} />
                    <ProgressMeter
                      label="Utilisation"
                      value={summary.issued}
                      max={summary.totalCopies || 1}
                      color={summary.utilisation > 80 ? 'warning' : 'primary'}
                      valueLabel={`${summary.utilisation}%`}
                      hint={`${summary.overdue} overdue · ${data?.total_members ?? 0} members`}
                    />
                  </Box>
                </Box>
              </SectionCard>
            </Grid>
          </Grid>

          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={7}>
              <SectionCard
                title="Recent activity"
                subtitle="Newest first"
                icon={HistoryOutlinedIcon}
                iconColor="info"
                disableContentPadding
                action={
                  <Button
                    size="small"
                    variant="text"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
                    onClick={() => navigate('/transactions')}
                  >
                    All transactions
                  </Button>
                }
              >
                {activities.length > 0 ? (
                  <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
                    {activities.map((activity, index) => {
                      const { icon: Icon, color } = activityAppearance(activity.type)
                      return (
                        <Box
                          key={activity.id ?? index}
                          sx={{
                            display: 'flex',
                            gap: 1.75,
                            px: 2.25,
                            py: 1.5,
                            borderBottom: index < activities.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                            transition: 'background-color 0.14s',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: 1.5,
                              flexShrink: 0,
                              mt: 0.25,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: `${color}.light`,
                              color: (t) => (t.palette.mode === 'light' ? `${color}.dark` : `${color}.main`),
                            }}
                          >
                            <Icon sx={{ fontSize: 16 }} />
                          </Box>
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'space-between',
                                gap: 1,
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 620 }} noWrap>
                                {activity.type}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.disabled', flexShrink: 0, whiteSpace: 'nowrap' }}
                              >
                                {formatRelativeTime(activity.timestamp)}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                              {activity.details}
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                ) : (
                  <Box sx={{ p: 2.25 }}>
                    <EmptyState
                      title="No activity yet"
                      description="Issues, returns and catalogue changes will appear here as they happen."
                      icon={HistoryOutlinedIcon}
                      compact
                    />
                  </Box>
                )}
              </SectionCard>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Stack spacing={2.5} sx={{ height: '100%' }}>
                <SectionCard
                  title="BookHive Insights"
                  subtitle="Generated from live library data"
                  icon={AutoAwesomeOutlinedIcon}
                  iconColor="secondary"
                >
                  {data?.insights && data.insights.length > 0 ? (
                    <Stack spacing={1.25}>
                      {data.insights.map((insight, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: 'flex',
                            gap: 1.25,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'background.subtle',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <LightbulbOutlinedIcon
                            sx={{ fontSize: 17, color: 'secondary.main', flexShrink: 0, mt: 0.25 }}
                          />
                          <Typography variant="body2" sx={{ minWidth: 0 }}>
                            {insight}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <EmptyState
                      title="No insights yet"
                      description="Insights appear as the catalogue and circulation history grow."
                      icon={AutoAwesomeOutlinedIcon}
                      compact
                      bordered={false}
                    />
                  )}
                </SectionCard>

                <SectionCard title="Quick actions" icon={BoltOutlinedIcon} iconColor="warning">
                  <Box
                    sx={{
                      display: 'grid',
                      gap: 1.25,
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    }}
                  >
                    {QUICK_ACTIONS.map((action) => {
                      const Icon = action.icon
                      return (
                        <Box
                          key={action.path}
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(action.path)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              navigate(action.path)
                            }
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            p: 1.5,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            cursor: 'pointer',
                            transition: 'border-color 0.15s, background-color 0.15s, transform 0.15s',
                            '&:hover': {
                              borderColor: `${action.color}.main`,
                              bgcolor: 'action.hover',
                            },
                            '&:focus-visible': {
                              outline: (t) => `2px solid ${t.palette.primary.main}`,
                              outlineOffset: 2,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: 1.5,
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: `${action.color}.light`,
                              color: (t) =>
                                t.palette.mode === 'light' ? `${action.color}.dark` : `${action.color}.main`,
                            }}
                          >
                            <Icon sx={{ fontSize: 16 }} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 620 }} noWrap>
                              {action.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                              {action.hint}
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                </SectionCard>
              </Stack>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}

function errorMessage(error) {
  if (error?.response?.status === 403) return 'You do not have access to the dashboard.'
  return error?.response?.data?.detail || 'Failed to load dashboard data.'
}
