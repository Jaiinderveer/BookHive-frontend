import { useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'

import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'

import { getMembers, deleteMember } from '../../services/memberService.js'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import { formatDate, initials } from '../../utils/format.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import ResponsiveTable from '../../components/ui/ResponsiveTable.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import EntityCell from '../../components/ui/EntityCell.jsx'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateViews.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import MemberFormDialog from './MemberFormDialog.jsx'

function AccountChip({ member }) {
  return member.user_id ? (
    <Chip size="small" color="success" variant="outlined" label="Login enabled" />
  ) : (
    <Chip size="small" color="warning" variant="outlined" label="No login" />
  )
}

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
  const withLogin = members.filter((m) => m.user_id).length

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

  const openEdit = (member) => {
    setEditing(member)
    setFormOpen(true)
  }

  const rowActions = (m) => (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      <Tooltip title="Edit member">
        <IconButton size="small" onClick={() => openEdit(m)} aria-label="Edit member" sx={{ color: 'text.secondary' }}>
          <EditOutlinedIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete member">
        <IconButton size="small" color="error" onClick={() => setDeleting(m)} aria-label="Delete member">
          <DeleteOutlineIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  )

  const columns = [
    {
      id: 'name',
      label: 'Member',
      minWidth: 240,
      render: (m) => <EntityCell initials={initials(m.name)} title={m.name} subtitle={m.email} />,
    },
    {
      id: 'membership',
      label: 'Membership ID',
      render: (m) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: (t) => t.typography.fontFamilyMonospace, fontSize: '0.8125rem', color: 'text.secondary' }}
        >
          {m.membership_id}
        </Typography>
      ),
    },
    {
      id: 'phone',
      label: 'Phone',
      render: (m) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {m.phone || '—'}
        </Typography>
      ),
    },
    {
      id: 'joined',
      label: 'Joined',
      render: (m) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {formatDate(m.created_at)}
        </Typography>
      ),
    },
    { id: 'account', label: 'Account', render: (m) => <AccountChip member={m} /> },
    { id: 'actions', label: '', align: 'right', width: 96, render: rowActions },
  ]

  const renderCard = (m) => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <EntityCell
            initials={initials(m.name)}
            size={40}
            title={m.name}
            subtitle={m.membership_id}
            titleProps={{ fontSize: '0.9375rem' }}
          />
        </Box>
        <Box sx={{ flexShrink: 0 }}>{rowActions(m)}</Box>
      </Box>

      <Stack spacing={0.75} sx={{ mt: 1.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <MailOutlineIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {m.email}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary">
            {m.phone || '—'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventAvailableOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary">
            Joined {formatDate(m.created_at)}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ mt: 1.5 }}>
        <AccountChip member={m} />
      </Box>
    </Box>
  )

  return (
    <Box>
      <PageHeader
        title="Members"
        subtitle="Manage library memberships and account access."
        icon={PeopleOutlineIcon}
        meta={
          allMembers && !loading && !error ? (
            <Stack direction="row" spacing={1}>
              <Chip
                size="small"
                variant="outlined"
                label={`${members.length} ${members.length === 1 ? 'member' : 'members'}${hasActiveSearch ? ' matching' : ''}`}
              />
              <Chip size="small" variant="outlined" color="success" label={`${withLogin} with login`} />
            </Stack>
          ) : null
        }
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: 18 }} />}
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            Add member
          </Button>
        }
      />

      <Box component="form" onSubmit={handleSearch}>
        <FilterBar
          title="Find a member"
          columns={1}
          activeCount={hasActiveSearch ? 1 : 0}
          onClear={handleClearSearch}
          actions={
            <Button type="submit" size="small" variant="contained" startIcon={<SearchIcon sx={{ fontSize: 16 }} />}>
              Search
            </Button>
          }
        >
          <TextField
            label="Name, email, phone or membership ID"
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
      </Box>

      {loading ? (
        <LoadingState label="Loading members…" />
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={reload} />
      ) : members.length === 0 ? (
        <EmptyState
          title="No members found"
          description={
            hasActiveSearch
              ? 'No member matches that search. Try a different name, email or membership ID.'
              : 'Add your first member to start issuing books.'
          }
          icon={PeopleOutlineIcon}
          action={
            hasActiveSearch ? (
              <Button variant="outlined" onClick={handleClearSearch}>
                Clear search
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                Add member
              </Button>
            )
          }
        />
      ) : (
        <ResponsiveTable
          columns={columns}
          rows={members}
          getRowKey={(m) => m.id}
          renderCard={renderCard}
          footer={`${members.length} ${members.length === 1 ? 'member' : 'members'} shown`}
        />
      )}

      {formOpen && (
        <MemberFormDialog
          member={editing}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this member?"
        message={deleting ? `“${deleting.name}” will be removed from the member list. This cannot be undone.` : ''}
        confirmLabel="Delete member"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
        loading={deleteLoading}
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
