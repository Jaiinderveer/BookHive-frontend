import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { createBook, updateBook } from '../../services/bookService.js'
import { getErrorMessage } from '../../services/apiClient.js'

const EMPTY = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  publisher: '',
  publication_year: '',
  quantity: '',
}

function initialForm(book) {
  if (!book) return EMPTY
  return {
    title: book.title || '',
    author: book.author || '',
    isbn: book.isbn || '',
    category: book.category || '',
    publisher: book.publisher || '',
    publication_year: book.publication_year != null ? String(book.publication_year) : '',
    quantity: book.quantity != null ? String(book.quantity) : '',
  }
}

// The dialog is mounted only while open (parent renders it conditionally),
// so form state is naturally fresh each time it opens.
export default function BookFormDialog({ book, onClose, onSaved, open = true }) {
  const isEdit = Boolean(book)
  const [form, setForm] = useState(() => initialForm(book))
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const quantity = Number(form.quantity)
    if (!form.title.trim() || !form.author.trim() || !form.isbn.trim() || !form.category.trim()) {
      setError('Please fill in the required fields (title, author, ISBN, category).')
      return
    }
    if (Number.isNaN(quantity) || quantity < 0) {
      setError('Quantity must be a non-negative number.')
      return
    }

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim(),
      category: form.category.trim(),
      publisher: form.publisher.trim() || null,
      publication_year: form.publication_year ? Number(form.publication_year) : null,
      quantity,
    }
    // For new books the initial available copies equal the total quantity.
    // When editing, availability is derived by the backend from issued copies.
    if (!isEdit) payload.available_quantity = quantity

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateBook(book.id, payload)
      } else {
        await createBook(payload)
      }
      onSaved()
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="book-form-title">
      <DialogTitle id="book-form-title">{isEdit ? 'Edit Book' : 'Add Book'}</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Required: title, author, ISBN, category.
        </Typography>
        <Box component="form" id="book-form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField label="Title" name="title" value={form.title} onChange={handleChange} required fullWidth />
            <TextField label="Author" name="author" value={form.author} onChange={handleChange} required fullWidth />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="ISBN" name="isbn" value={form.isbn} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Category" name="category" value={form.category} onChange={handleChange} required fullWidth />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Publisher"
                  name="publisher"
                  value={form.publisher}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Publication year"
                  name="publication_year"
                  type="number"
                  value={form.publication_year}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            <TextField
              label="Quantity (copies)"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              required
              inputProps={{ min: 0 }}
              fullWidth
              helperText="Available copies will be set to this total for new books."
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="book-form"
          variant="contained"
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add Book'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
