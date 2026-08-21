import { useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import { getBooks } from '../../services/bookService.js'
import { getMembers } from '../../services/memberService.js'
import { issueBook } from '../../services/transactionService.js'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { LoadingState, ErrorState } from '../../components/ui/StateViews.jsx'

function toDueDate(value) {
  const d = new Date(value)
  d.setHours(23, 59, 59, 0)
  return d.toISOString()
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

export default function IssueBook() {
  const booksLoader = useCallback(() => getBooks(), [])
  const { data: allBooks, loading: booksLoading, error: booksError, reload: reloadBooks } = useAsync(booksLoader)
  const membersLoader = useCallback(() => getMembers(), [])
  const { data: members, loading: membersLoading, error: membersError, reload: reloadMembers } = useAsync(membersLoader)

  const availableBooks = (allBooks || []).filter((b) => b.available_quantity > 0)

  const [book, setBook] = useState(null)
  const [member, setMember] = useState(null)
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().slice(0, 10)
  })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [snack, setSnack] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!book) return setError('Please select a book.')
    if (!member) return setError('Please select a member.')
    if (!dueDate) return setError('Please select a due date.')

    setSubmitting(true)
    try {
      await issueBook({ book_id: book.id, member_id: member.id, due_date: toDueDate(dueDate) })
      setSnack({ severity: 'success', message: `Issued "${book.title}" to ${member.name}.` })
      setBook(null)
      setMember(null)
      reloadBooks()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const dataError = booksError || membersError
  const dataLoading = booksLoading || membersLoading

  return (
    <Box>
      <PageHeader title="Issue Book" subtitle="Lend a book to a member" />
      <Divider sx={{ mb: 3 }} />

      <Card sx={{ maxWidth: 640 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <AssignmentTurnedInIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
              Issue New Book
            </Typography>
          </Box>
          {dataLoading ? (
            <LoadingState label="Loading library data…" />
          ) : dataError ? (
            <ErrorState message={getErrorMessage(dataError)} onRetry={() => { reloadBooks(); reloadMembers(); }} />
          ) : (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.5}>
                {error && <Alert severity="error">{error}</Alert>}

                <Autocomplete
                  options={availableBooks}
                  getOptionLabel={(b) => `${b.title} — ${b.author}`}
                  value={book}
                  onChange={(_, v) => setBook(v)}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  renderInput={(params) => (
                    <TextField {...params} label="Book" required placeholder="Select an available book" />
                  )}
                />
                <Typography variant="caption" color="text.secondary">
                  {availableBooks.length} book{availableBooks.length === 1 ? '' : 's'} currently available.
                </Typography>

                <Autocomplete
                  options={members || []}
                  getOptionLabel={(m) => `${m.name} (${m.membership_id})`}
                  value={member}
                  onChange={(_, v) => setMember(v)}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  renderInput={(params) => <TextField {...params} label="Member" required placeholder="Select a member" />}
                />

                    <TextField
                      label="Due date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: getTodayDate(),
                      }}
                      helperText="The due date cannot be in the past."
                    />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {submitting ? 'Issuing…' : 'Issue Book'}
                </Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnack(null)} severity={snack?.severity || 'info'} sx={{ width: '100%' }}>{snack?.message}</Alert>
      </Snackbar>
    </Box>
  )
}
