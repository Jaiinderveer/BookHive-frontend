import { useMediaQuery } from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'

// Renders a table on medium+ screens and a card list on small screens so the
// page never requires horizontal scrolling.
// columns: [{ id, label, render(row), align? }]
export default function ResponsiveTable({ columns, rows = [], getRowKey, renderCard }) {
  const isMobile = useMediaQuery('(max-width: 899.95px)')

  if (isMobile) {
    return (
      <Stack spacing={1.5}>
        {rows.map((row) => (
          <Card key={getRowKey(row)} sx={{ p: 2 }}>
            {renderCard(row)}
          </Card>
        ))}
      </Stack>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Card} sx={{ overflowX: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || 'left'}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getRowKey(row)} hover>
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
    </Box>
  )
}
