import { useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import { getBooks } from '../../services/bookService.js'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { LoadingState, EmptyState, ErrorState } from '../../components/ui/StateViews.jsx'

export default function BrowseBooks() {
  const [filters, setFilters] = useState({ search: '' })
  const [query, setQuery] = useState('')

  const hasActiveSearch = Boolean(query)

  const loader = useCallback(() => {
    // The backend supports title/author/isbn/category search; we send the term
    // as a title match for a simple member-facing search.
    return getBooks(query.trim() ? { title: query.trim() } : {})
  }, [query])
  const { data: books, loading, error, reload } = useAsync(loader, { immediate: true })

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(filters.search)
  }

  const handleClearSearch = () => {
    setFilters({ search: '' })
    setQuery('')
  }

  return (
    <Box>
      <PageHeader title="Browse Books" subtitle="Explore the library catalog" />

      {/* Search Bar */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" component="h2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="primary" sx={{ fontSize: 22 }} />
            Search Catalog
          </Typography>
          {hasActiveSearch && (
            <Button variant="text" startIcon={<ClearIcon />} size="small" onClick={handleClearSearch} color="secondary">
              Clear search
            </Button>
          )}
        </Box>
        <Box component="form" onSubmit={handleSearch}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField label="Search by title" size="small" value={filters.search} onChange={(e) => setFilters({ search: e.target.value })} fullWidth />
            <Button type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ alignSelf: 'stretch', minWidth: 120 }}>
              Search
            </Button>
          </Stack>
        </Box>
      </Card>

      {loading ? (
        <LoadingState label="Loading books…" />
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={reload} />
      ) : books && books.length === 0 ? (
        <EmptyState title="No books found" description={query ? 'Try a different search.' : 'The catalog is currently empty.'} />
      ) : (
        <Grid container spacing={2}>
          {(books || []).map((book) => {
            const available = book.available_quantity > 0
            return (
              <Grid item xs={12} sm={6} lg={4} key={book.id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'primary.light',
                          color: 'primary.dark',
                        }}
                      >
                        <MenuBookOutlinedIcon fontSize="small" />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={600} lineHeight={1.3}>
                          {book.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {book.author}
                        </Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      <Chip size="small" variant="outlined" label={book.category} />
                      <Chip
                        size="small"
                        color={available ? 'success' : 'error'}
                        variant="outlined"
                        label={available ? `${book.available_quantity} available` : 'Out of stock'}
                      />
                    </Box>
                    {book.publisher && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                        {book.publisher}
                        {book.publication_year ? `, ${book.publication_year}` : ''}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}
