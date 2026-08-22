import { useCallback, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'

import SearchIcon from '@mui/icons-material/Search'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined'

import { getBooks } from '../../services/bookService.js'
import { useAsync } from '../../hooks/useAsync.js'
import { getErrorMessage } from '../../services/apiClient.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import { EmptyState, ErrorState, CardGridLoadingState } from '../../components/ui/StateViews.jsx'

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

  const availableCount = (books || []).filter((b) => b.available_quantity > 0).length

  return (
    <Box>
      <PageHeader
        title="Browse books"
        subtitle="Explore the catalogue and see what is on the shelf right now."
        icon={LibraryBooksOutlinedIcon}
        meta={
          books && !loading && !error ? (
            <Chip
              size="small"
              variant="outlined"
              label={`${availableCount} of ${books.length} available${hasActiveSearch ? ' in this search' : ''}`}
            />
          ) : null
        }
      />

      <Box component="form" onSubmit={handleSearch}>
        <FilterBar
          title="Search the catalogue"
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
            label="Search by title"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
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
        <CardGridLoadingState count={6} />
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={reload} />
      ) : books && books.length === 0 ? (
        <EmptyState
          title="No books found"
          description={query ? 'No title matches that search. Try fewer or different words.' : 'The catalogue is currently empty.'}
          icon={LibraryBooksOutlinedIcon}
          action={
            hasActiveSearch ? (
              <Button variant="outlined" onClick={handleClearSearch}>
                Clear search
              </Button>
            ) : null
          }
        />
      ) : (
        <Grid container spacing={2}>
          {(books || []).map((book) => {
            const available = book.available_quantity > 0
            return (
              <Grid item xs={12} sm={6} lg={4} key={book.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'border-color 180ms cubic-bezier(0.32, 0.72, 0, 1), transform 180ms cubic-bezier(0.32, 0.72, 0, 1)',
                    '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
                  }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: 1.75 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 2,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'primary.light',
                          color: (t) => (t.palette.mode === 'light' ? 'primary.dark' : 'primary.main'),
                        }}
                      >
                        <MenuBookOutlinedIcon sx={{ fontSize: 19 }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1.35 }}>
                          {book.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {book.author}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {book.category && <Chip size="small" variant="outlined" label={book.category} />}
                      <Chip
                        size="small"
                        color={available ? 'success' : 'error'}
                        label={available ? `${book.available_quantity} available` : 'All copies out'}
                      />
                    </Box>

                    <Box
                      sx={{
                        mt: 'auto',
                        pt: 1.5,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 0 }} noWrap>
                        {book.publisher || 'Publisher not recorded'}
                        {book.publication_year ? `, ${book.publication_year}` : ''}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', fontFamily: (t) => t.typography.fontFamilyMonospace, flexShrink: 0 }}
                      >
                        {book.isbn}
                      </Typography>
                    </Box>
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
