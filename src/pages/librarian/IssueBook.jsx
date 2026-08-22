import { useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import EventOutlinedIcon from '@mui/icons-material/EventOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

import { getBooks } from '../../services/bookService.js'
import { getMembers } from '../../services/memberService.js'
import { issueBook } from '../../services/transactionService.js'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import { formatDate, initials } from '../../utils/format.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import SectionCard from '../../components/ui/SectionCard.jsx'
import EntityCell from '../../components/ui/EntityCell.jsx'
import { LoadingState, ErrorState } from '../../components/ui/StateViews.jsx'

function toDueDate(value) {
  const d = new Date(value)
  d.setHours(23, 59, 59, 0)
  return d.toISOString()
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

// Loan-length shortcuts. These only prefill the same date field the librarian
// can still edit by hand, so the submitted value is unchanged in kind.
const PRESETS = [7, 14, 30]

function dateInDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
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
  const ready = Boolean(book && member && dueDate)

  return (
    <Box>
      <PageHeader
        title="Issue book"
        subtitle="Lend a copy to a member and set the return date."
        icon={AssignmentTurnedInOutlinedIcon}
        meta={
          !dataLoading && !dataError ? (
            <Chip
              size="small"
              variant="outlined"
              label={`${availableBooks.length} ${availableBooks.length === 1 ? 'title' : 'titles'} available`}
            />
          ) : null
        }
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <SectionCard
            title="Loan details"
            subtitle="Pick a book, a member and the due date."
            icon={AssignmentTurnedInOutlinedIcon}
          >
            {dataLoading ? (
              <LoadingState label="Loading library data…" compact />
            ) : dataError ? (
              <ErrorState
                message={getErrorMessage(dataError)}
                onRetry={() => {
                  reloadBooks()
                  reloadMembers()
                }}
                compact
              />
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                  {error && <Alert severity="error">{error}</Alert>}

                  <Box>
                    <Autocomplete
                      options={availableBooks}
                      getOptionLabel={(b) => `${b.title} — ${b.author}`}
                      value={book}
                      onChange={(_, v) => setBook(v)}
                      isOptionEqualToValue={(opt, val) => opt.id === val.id}
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box sx={{ width: '100%', minWidth: 0 }}>
                            <EntityCell
                              icon={MenuBookOutlinedIcon}
                              size={30}
                              title={option.title}
                              subtitle={`${option.author} · ${option.available_quantity} of ${option.quantity} in`}
                            />
                          </Box>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField {...params} label="Book" required placeholder="Search available books" />
                      )}
                    />
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'text.secondary' }}>
                      Only titles with a free copy are listed — {availableBooks.length} right now.
                    </Typography>
                  </Box>

                  <Autocomplete
                    options={members || []}
                    getOptionLabel={(m) => `${m.name} (${m.membership_id})`}
                    value={member}
                    onChange={(_, v) => setMember(v)}
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ width: '100%', minWidth: 0 }}>
                          <EntityCell
                            initials={initials(option.name)}
                            size={30}
                            title={option.name}
                            subtitle={option.membership_id}
                          />
                        </Box>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField {...params} label="Member" required placeholder="Search members" />
                    )}
                  />

                  <Box>
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
                    <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }} useFlexGap>
                      {PRESETS.map((days) => {
                        const value = dateInDays(days)
                        return (
                          <Chip
                            key={days}
                            size="small"
                            label={`${days} days`}
                            variant={dueDate === value ? 'filled' : 'outlined'}
                            color={dueDate === value ? 'primary' : 'default'}
                            onClick={() => setDueDate(value)}
                          />
                        )
                      })}
                    </Stack>
                  </Box>

                  <Divider />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    startIcon={
                      submitting ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 18 }} />
                      )
                    }
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {submitting ? 'Issuing…' : 'Issue book'}
                  </Button>
                </Stack>
              </Box>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <SectionCard title="Summary" subtitle="Check before you confirm" icon={InfoOutlinedIcon} iconColor="info">
            <Stack spacing={2}>
              <Box>
                <Typography variant="overline" sx={{ display: 'block', color: 'text.disabled', mb: 0.75 }}>
                  Book
                </Typography>
                {book ? (
                  <EntityCell
                    icon={MenuBookOutlinedIcon}
                    title={book.title}
                    subtitle={`${book.author} · ${book.available_quantity} of ${book.quantity} available`}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    No book selected yet
                  </Typography>
                )}
              </Box>

              <Divider />

              <Box>
                <Typography variant="overline" sx={{ display: 'block', color: 'text.disabled', mb: 0.75 }}>
                  Member
                </Typography>
                {member ? (
                  <EntityCell
                    initials={initials(member.name)}
                    color="info"
                    title={member.name}
                    subtitle={`${member.membership_id}${member.phone ? ` · ${member.phone}` : ''}`}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                    No member selected yet
                  </Typography>
                )}
              </Box>

              <Divider />

              <Box>
                <Typography variant="overline" sx={{ display: 'block', color: 'text.disabled', mb: 0.75 }}>
                  Due date
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventOutlinedIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {dueDate ? formatDate(dueDate) : '—'}
                  </Typography>
                </Box>
              </Box>

              <Alert
                severity={ready ? 'success' : 'info'}
                icon={ready ? undefined : <PersonOutlineIcon sx={{ fontSize: 18 }} />}
                sx={{ mt: 0.5 }}
              >
                {ready
                  ? 'Ready to issue — the copy count updates as soon as you confirm.'
                  : 'Select a book and a member to continue.'}
              </Alert>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

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
