import { useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import { getMembers, deleteMember } from '../../services/memberService.js'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import { formatDate, initials } from '../../utils/format.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import ResponsiveTable from '../../components/ui/ResponsiveTable.jsx'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateViews.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import MemberFormDialog from './MemberFormDialog.jsx'

export default function Members() {
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [snack, setSnack] = useState(null)

  const loader = useCallback(() => getMembers(), [])
  const { data: allMembers, loading, error, reload } = useAsync(loader)

  const members = (allMembers || []).filter((m) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      m.name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      m.membership_id?.toLowerCase().includes(q)
    )
  })

  const hasActiveSearch = Boolean(query)

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(search)
  }

  const handleClearSearch = () => {
    setSearch('')
    setQuery('')
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await deleteMember(deleting.id)
      setSnack({ severity: 'success', message: 'Member deleted.' })
      setDeleting(null)
      reload()
    } catch (err) {
      setSnack({ severity: 'error', message: getErrorMessage(err) })
      setDeleting(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSaved = () => {
    setFormOpen(false)
    setEditing(null)
    setSnack({ severity: 'success', message: 'Member saved.' })
    reload()
  }

  /*__JSX2__*/
  const columns = [
    {
      id: 'name',
      label: 'Member',
      render: (m) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', color: 'primary.dark', fontSize: 14 }}>{initials(m.name)}</Avatar>
          <Box>
            <Typography fontWeight={600} variant="body1">{m.name}</Typography>
            <Typography variant="body2" color="text.secondary">{m.email}</Typography>
          </Box>
        </Stack>
      ),
    },
    { id: 'membership', label: 'Membership ID', render: (m) => <Typography variant="body2" color="text.secondary">{m.membership_id}</Typography> },
    { id: 'phone', label: 'Phone', render: (m) => m.phone },
    { id: 'joined', label: 'Joined', render: (m) => formatDate(m.created_at) },
    {
      id: 'account',
      label: 'Account',
      render: (m) =>
        m.user_id ? (
          <Chip size="small" color="success" variant="outlined" label="Has login" />
        ) : (
          <Chip size="small" color="warning" variant="outlined" label="No login" />
        ),
    },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (m) => (
        <Stack direction="row" justifyContent="flex-end">
          <IconButton aria-label="Edit" onClick={() => { setEditing(m); setFormOpen(true); }}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="Delete" color="error" onClick={() => setDeleting(m)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ]

  const renderCard = (m) => {
    const hasLogin = Boolean(m.user_id)
    return (
      <Card sx={{ height: '100%', transition: 'transform 0.2s ease, box-shadow 0.2s ease', '&:hover': { transform: 'translateY(-2px)' } }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.light', color: 'primary.dark', flexShrink: 0 }}>{initials(m.name)}</Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom lineHeight={1.3}>
                {m.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {m.email}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" mt={1} alignItems="center">
                <Chip size="small" variant="outlined" label={m.membership_id} />
                <Chip size="small" variant="outlined" label={m.phone} />
                <Chip
                  size="small"
                  color={hasLogin ? 'success' : 'warning'}
                  variant="outlined"
                  label={hasLogin ? 'Has login' : 'No login'}
                />
              </Stack>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
              <IconButton size="small" onClick={() => { setEditing(m); setFormOpen(true); }} aria-label="Edit member">
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => setDeleting(m)} aria-label="Delete member">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box>
      <PageHeader
        title="Members"
        subtitle="Manage library members"
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>Add Member</Button>}
      />

      {/* Search Bar */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="primary" sx={{ fontSize: 22 }} />
            Search Members
          </Typography>
          {hasActiveSearch && (
            <Button variant="text" startIcon={<ClearIcon />} size="small" onClick={handleClearSearch} color="secondary">
              Clear search
            </Button>
          )}
        </Box>
        <Box component="form" onSubmit={handleSearch}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField label="Search by name, email, phone or membership ID" size="small" value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
            <Button type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ alignSelf: 'stretch', minWidth: 120 }}>
              Search
            </Button>
          </Stack>
        </Box>
      </Card>

      {loading ? (
        <LoadingState label="Loading members…" />
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={reload} />
      ) : members.length === 0 ? (
        <EmptyState title="No members found" description={query ? 'Try adjusting your search.' : 'Add members to get started.'} />
      ) : (
        <ResponsiveTable columns={columns} rows={members} getRowKey={(m) => m.id} renderCard={renderCard} />
      )}

      {formOpen && <MemberFormDialog member={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={handleSaved} />}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete member?"
        message={deleting ? `Are you sure you want to delete "${deleting.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
      />

      <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack(null)} severity={snack?.severity || 'info'} sx={{ width: '100%' }}>{snack?.message}</Alert>
      </Snackbar>
    </Box>
  )
}
