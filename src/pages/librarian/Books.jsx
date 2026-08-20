import { useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

import { getBooks, deleteBook } from '../../services/bookService.js'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import ResponsiveTable from '../../components/ui/ResponsiveTable.jsx'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateViews.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import BookFormDialog from './BookFormDialog.jsx'

export default function Books() {
  const [filters, setFilters] = useState({ title: '', author: '', category: '', isbn: '' })
  const [searchInput, setSearchInput] = useState({ title: '', author: '', category: '', isbn: '' })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [snack, setSnack] = useState(null)

  const loader = useCallback(() => getBooks(filters), [filters])
  const { data: books, loading, error, reload } = useAsync(loader)

  const hasActiveFilters = Boolean(filters.title || filters.author || filters.category || filters.isbn)

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters({ ...searchInput })
  }

  const handleClearFilters = () => {
    setSearchInput({ title: '', author: '', category: '', isbn: '' })
    setFilters({ title: '', author: '', category: '', isbn: '' })
  }

  const handleDelete = async () => {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await deleteBook(deleting.id)
      setSnack({ severity: 'success', message: 'Book deleted.' })
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
    setSnack({ severity: 'success', message: 'Book saved.' })
    reload()
  }

  const columns = [
    { id: 'title', label: 'Title', render: (b) => <Typography fontWeight={600} variant='body1'>{b.title}</Typography> },
    { id: 'author', label: 'Author', render: (b) => <Typography color='text.secondary'>{b.author}</Typography> },
    { id: 'isbn', label: 'ISBN', render: (b) => <Typography variant='body2' fontFamily='monospace' fontSize='0.8125rem'>{b.isbn}</Typography> },
    { id: 'category', label: 'Category', render: (b) => <Chip size='small' label={b.category} color='default' variant='outlined' /> },
    { id: 'availability', label: 'Availability', render: (b) => {
        const available = b.available_quantity > 0
        return (
          <Chip
            size='small'
            color={available ? 'success' : 'error'}
            variant='outlined'
            label={available ? b.available_quantity + ' available' : 'Out of stock'}
            icon={available ? <CheckCircleOutlineIcon fontSize='small' /> : undefined}
          />
        )
      }
    },
    { id: 'total', label: 'Total', render: (b) => <Typography variant='body2' color='text.secondary'>{b.quantity} copies</Typography> },
    { id: 'actions', label: '', align: 'right', render: (b) => (
        <Stack direction='row' spacing={1} justifyContent='flex-end'>
          <IconButton size='small' onClick={() => { setEditing(b); setFormOpen(true); }} aria-label='Edit book'>
            <EditOutlinedIcon fontSize='small' />
          </IconButton>
          <IconButton size='small' color='error' onClick={() => setDeleting(b)} aria-label='Delete book'>
            <DeleteOutlineIcon fontSize='small' />
          </IconButton>
        </Stack>
      )
    },
  ]

  const renderCard = (b) => {
    const available = b.available_quantity > 0
    return (
      <Card sx={{ height: '100%', transition: 'transform 0.2s ease, box-shadow 0.2s ease', '&:hover': { transform: 'translateY(-2px)' } }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Avatar
              sx={{ width: 48, height: 48, bgcolor: 'primary.light', color: 'primary.dark', flexShrink: 0 }}
            >
              <MenuBookOutlinedIcon fontSize='medium' />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant='h6' fontWeight={700} gutterBottom lineHeight={1.3}>
                {b.title}
              </Typography>
              <Typography variant='body2' color='text.secondary' gutterBottom>
                {b.author}
              </Typography>
              <Stack direction='row' spacing={1} flexWrap='wrap' mt={1}>
                <Chip size='small' label={b.category} color='default' variant='outlined' />
                <Chip
                  size='small'
                  color={available ? 'success' : 'error'}
                  variant='outlined'
                  label={available ? b.available_quantity + ' available' : 'Out of stock'}
                  icon={available ? <CheckCircleOutlineIcon fontSize='small' /> : undefined}
                />
                <Chip size='small' variant='outlined' label={b.quantity + ' copies'} />
              </Stack>
              {(b.publisher || b.publication_year) && (
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1.5 }}>
                  {b.publisher}
                  {b.publication_year && <span> ({b.publication_year})</span>}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
              <IconButton size='small' onClick={() => { setEditing(b); setFormOpen(true); }} aria-label='Edit book'>
                <EditOutlinedIcon fontSize='small' />
              </IconButton>
              <IconButton size='small' color='error' onClick={() => setDeleting(b)} aria-label='Delete book'>
                <DeleteOutlineIcon fontSize='small' />
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
        title='Books'
        subtitle='Manage your library catalog'
        actions={<Button variant='contained' startIcon={<AddIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>Add Book</Button>}
      />

      {/* Search & Filter Bar */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant='h6' component='h2' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color='primary' sx={{ fontSize: 22 }} />
            Search & Filter
          </Typography>
          {hasActiveFilters && (
            <Button variant='text' startIcon={<ClearIcon />} size='small' onClick={handleClearFilters} color='secondary'>
              Clear all filters
            </Button>
          )}
        </Box>
        <Box component='form' onSubmit={handleSearch}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField label='Title' size='small' value={searchInput.title} onChange={(e) => setSearchInput((f) => ({ ...f, title: e.target.value }))} fullWidth />
            <TextField label='Author' size='small' value={searchInput.author} onChange={(e) => setSearchInput((f) => ({ ...f, author: e.target.value }))} fullWidth />
            <TextField label='Category' size='small' value={searchInput.category} onChange={(e) => setSearchInput((f) => ({ ...f, category: e.target.value }))} fullWidth />
            <TextField label='ISBN' size='small' value={searchInput.isbn} onChange={(e) => setSearchInput((f) => ({ ...f, isbn: e.target.value }))} fullWidth />
            <Button type='submit' variant='contained' startIcon={<SearchIcon />} sx={{ alignSelf: 'stretch', minWidth: 120 }}>
              Search
            </Button>
          </Stack>
        </Box>
      </Card>

      {loading ? (
        <LoadingState label='Loading books...' />
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={reload} />
      ) : books && books.length === 0 ? (
        <EmptyState
          title='No books found'
          description={filters.title || filters.author || filters.category || filters.isbn ? 'Try adjusting your search.' : 'Add your first book to get started.'}
        />
      ) : (
        <ResponsiveTable columns={columns} rows={books || []} getRowKey={(b) => b.id} renderCard={renderCard} />
      )}

      {formOpen && <BookFormDialog book={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSaved={handleSaved} />}

      <ConfirmDialog
        open={Boolean(deleting)}
        title='Delete book?'
        message={deleting ? 'Are you sure you want to delete ' + deleting.title + '? This cannot be undone.' : ''}
        confirmLabel='Delete'
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
