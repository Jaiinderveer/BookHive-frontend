import useMediaQuery from '@mui/material/useMediaQuery'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// Renders a table on medium+ screens and a card list on small screens so the
// page never requires horizontal scrolling.
// columns: [{ id, label, render(row), align?, width? }]
export default function ResponsiveTable({
  columns,
  rows = [],
  getRowKey,
  renderCard,
  onRowClick,
  footer,
  maxHeight,
}) {
  const isMobile = useMediaQuery('(max-width: 899.95px)')

  if (isMobile) {
    return (
      <Stack spacing={1.5}>
        {rows.map((row) => (
          <Card
            key={getRowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            sx={{
              p: 2,
              minWidth: 0,
              cursor: onRowClick ? 'pointer' : 'default',
              '&:active': onRowClick ? { bgcolor: 'action.hover' } : undefined,
            }}
          >
            {renderCard(row)}
          </Card>
        ))}
        {footer && <Box sx={{ pt: 0.5 }}>{footer}</Box>}
      </Stack>
    )
  }

  return (
    <Card sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight, overflowX: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{ width: col.width, minWidth: col.minWidth }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                hover
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align || 'left'}>
                    {col.render ? col.render(row) : row[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {footer && (
        <Box
          sx={{
            px: 2,
            py: 1.25,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.subtle',
          }}
        >
          <Typography variant="caption" color="text.secondary" component="div">
            {footer}
          </Typography>
        </Box>
      )}
    </Card>
  )
}
