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

import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined'

import { getBooks, deleteBook } from '../../services/bookService.js'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import ResponsiveTable from '../../components/ui/ResponsiveTable.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import EntityCell from '../../components/ui/EntityCell.jsx'
import { LoadingState, EmptyState, ErrorState, TableLoadingState } from '../../components/ui/StateViews.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import BookFormDialog from './BookFormDialog.jsx'

const EMPTY_FILTERS = { title: '', author: '', category: '', isbn: '' }

// Availability reads as one chip everywhere: table, mobile card and dialogs.
function AvailabilityChip({ book }) {
  const available = book.available_quantity > 0
  const partial = available && book.available_quantity < book.quantity
  return (
    <Chip
      size="small"
      color={available ? (partial ? 'warning' : 'success') : 'error'}
      label={available ? `${book.available_quantity} of ${book.quantity} in` : 'All copies out'}
    />
  )
}

export default function Books() {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [searchInput, setSearchInput] = useState(EMPTY_FILTERS)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [snack, setSnack] = useState(null)

  const loader = useCallback(() => getBooks(filters), [filters])
  const { data: books, loading, error, reload } = useAsync(loader)

  const activeFilterCount = Object.values(filters).filter(Boolean).length
  const hasActiveFilters = activeFilterCount > 0

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters({ ...searchInput })
  }

  const handleClearFilters = () => {
    setSearchInput(EMPTY_FILTERS)
    setFilters(EMPTY_FILTERS)
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

  const openEdit = (book) => {
    setEditing(book)
    setFormOpen(true)
  }

  const rowActions = (book) => (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      <Tooltip title="Edit book">
        <IconButton size="small" onClick={() => openEdit(book)} aria-label="Edit book" sx={{ color: 'text.secondary' }}>
          <EditOutlinedIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete book">
        <IconButton size="small" color="error" onClick={() => setDeleting(book)} aria-label="Delete book">
          <DeleteOutlineIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  )

  const columns = [
    {
      id: 'title',
      label: 'Book',
      minWidth: 260,
      render: (b) => (
        <EntityCell icon={MenuBookOutlinedIcon} title={b.title} subtitle={b.author} color="primary" />
      ),
    },
    {
      id: 'isbn',
      label: 'ISBN',
      render: (b) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: (t) => t.typography.fontFamilyMonospace, fontSize: '0.8125rem', color: 'text.secondary' }}
        >
          {b.isbn}
        </Typography>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      render: (b) => (b.category ? <Chip size="small" label={b.category} variant="outlined" /> : '—'),
    },
    {
      id: 'published',
      label: 'Published',
      render: (b) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {b.publisher || '—'}
          {b.publication_year ? ` · ${b.publication_year}` : ''}
        </Typography>
      ),
    },
    { id: 'availability', label: 'Availability', render: (b) => <AvailabilityChip book={b} /> },
    { id: 'actions', label: '', align: 'right', width: 96, render: rowActions },
  ]

  const renderCard = (b) => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <EntityCell
            icon={MenuBookOutlinedIcon}
            size={40}
            title={b.title}
            subtitle={b.author}
            color="primary"
            titleProps={{ fontSize: '0.9375rem' }}
          />
        </Box>
        <Box sx={{ flexShrink: 0 }}>{rowActions(b)}</Box>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
        <AvailabilityChip book={b} />
        {b.category && <Chip size="small" label={b.category} variant="outlined" />}
        {b.isbn && <Chip size="small" variant="outlined" label={b.isbn} />}
      </Stack>
      {(b.publisher || b.publication_year) && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
          {b.publisher}
          {b.publication_year ? ` (${b.publication_year})` : ''}
        </Typography>
      )}
    </Box>
  )

  return (
    <Box>
      <PageHeader
        title="Books"
        subtitle="Search, edit and keep the catalogue accurate."
        icon={LibraryBooksOutlinedIcon}
        meta={
          books && !loading && !error ? (
            <Chip
              size="small"
              variant="outlined"
              label={`${books.length} ${books.length === 1 ? 'title' : 'titles'}${hasActiveFilters ? ' matching' : ''}`}
            />
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
            Add book
          </Button>
        }
      />

      <Box component="form" onSubmit={handleSearch}>
        <FilterBar
          title="Search catalogue"
          activeCount={activeFilterCount}
          onClear={handleClearFilters}
          actions={
            <Button type="submit" size="small" variant="contained" startIcon={<SearchIcon sx={{ fontSize: 16 }} />}>
              Search
            </Button>
          }
        >
          <TextField
            label="Title"
            value={searchInput.title}
            onChange={(e) => setSearchInput((f) => ({ ...f, title: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Author"
            value={searchInput.author}
            onChange={(e) => setSearchInput((f) => ({ ...f, author: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Category"
            value={searchInput.category}
            onChange={(e) => setSearchInput((f) => ({ ...f, category: e.target.value }))}
            fullWidth
          />
          <TextField
            label="ISBN"
            value={searchInput.isbn}
            onChange={(e) => setSearchInput((f) => ({ ...f, isbn: e.target.value }))}
            fullWidth
          />
        </FilterBar>
      </Box>

      {loading ? (
        books ? (
          <TableLoadingState rows={6} columns={5} />
        ) : (
          <LoadingState label="Loading books…" />
        )
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={reload} />
      ) : books && books.length === 0 ? (
        <EmptyState
          title="No books found"
          description={
            hasActiveFilters
              ? 'No titles match these filters. Try a broader search or clear the filters.'
              : 'Add your first book to start building the catalogue.'
          }
          icon={LibraryBooksOutlinedIcon}
          action={
            hasActiveFilters ? (
              <Button variant="outlined" onClick={handleClearFilters}>
                Clear filters
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
                Add book
              </Button>
            )
          }
        />
      ) : (
        <ResponsiveTable
          columns={columns}
          rows={books || []}
          getRowKey={(b) => b.id}
          renderCard={renderCard}
          footer={`${books?.length || 0} ${books?.length === 1 ? 'title' : 'titles'} shown`}
        />
      )}

      {formOpen && (
        <BookFormDialog
          book={editing}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this book?"
        message={
          deleting
            ? `“${deleting.title}” will be removed from the catalogue. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete book"
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
        <Alert onClose={() => setSnack(null)} severity={snack?.severity || 'info'} variant="standard" sx={{ width: '100%' }}>
          {snack?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
