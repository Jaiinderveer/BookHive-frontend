import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'

import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined'
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

import { useAsync } from '../../hooks/useAsync.js'
import { getDashboard } from '../../services/dashboardService.js'
import { formatDateTime } from '../../utils/format.js'


import { LoadingState, ErrorState, EmptyState } from '../../components/ui/StateViews.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'

const STATS = [
  { key: 'total_books', label: 'Total Books', icon: MenuBookOutlinedIcon, color: 'primary' },
  { key: 'books_available', label: 'Available', icon: CheckCircleOutlineIcon, color: 'success' },
  { key: 'books_issued', label: 'Issued', icon: SwapHorizOutlinedIcon, color: 'warning' },
  { key: 'total_members', label: 'Total Members', icon: GroupOutlinedIcon, color: 'info' },
  { key: 'overdue_books', label: 'Overdue', icon: WarningAmberOutlinedIcon, color: 'error' },
  { key: 'today_transactions', label: "Today's Transactions", icon: TodayOutlinedIcon, color: 'secondary' },
]

// Quick action items for the AI assistant section
export default function LibrarianDashboard() {
  const { data, loading, error, reload } = useAsync(getDashboard)

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Library overview" />

      {loading ? (
        <LoadingState label="Loading dashboard…" />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={reload} />
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {STATS.map((stat) => (
              <Grid item xs={6} sm={4} lg={2} key={stat.key}>
                <StatCard
                  icon={stat.icon}
                  label={stat.label}
                  value={data ? data[stat.key] : null}
                  color={stat.color}
                />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Card>
                <CardHeader
                  avatar={<AutoAwesomeOutlinedIcon color="primary" />}
                  title="BookHive Insights"
                  subheader="Generated from live library data"
                />
                <Divider />
                <CardContent>
                  {data?.insights && data.insights.length > 0 ? (
                    <List dense disablePadding>
                      {data.insights.map((insight, i) => (
                        <ListItem key={i} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <LightbulbOutlinedIcon color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={insight} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <EmptyState
                      title="No insights yet"
                      description="Insights will appear here as the library grows."
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card>
                <CardHeader
                  avatar={<InfoOutlinedIcon color="primary" />}
                  title="Recent Activity"
                />
                <Divider />
                <CardContent sx={{ p: 0 }}>
                  {data?.activities && data.activities.length > 0 ? (
                    <List dense disablePadding>
                      {data.activities.map((activity) => (
                        <ListItem key={activity.id} sx={{ alignItems: 'flex-start' }} divider>
                          <ListItemText
                            primary={activity.type}
                            secondary={
                              <>
                                {activity.details}
                                <Box component="span" display="block" variant="caption" color="text.secondary">
                                  {formatDateTime(activity.timestamp)}
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ p: 2 }}>
                      <EmptyState
                        title="No activity yet"
                        description="Recent library activity will be shown here."
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
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
