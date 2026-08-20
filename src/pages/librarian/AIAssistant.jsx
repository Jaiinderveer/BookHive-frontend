import { useEffect, useRef, useState, useCallback } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import SendIcon from '@mui/icons-material/Send'
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'

import { sendChat } from '../../services/aiService.js'
import { getErrorMessage } from '../../services/apiClient.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import { useAI } from '../../context/AIContext.jsx'
import { getBooks } from '../../services/bookService.js'
import { getMembers } from '../../services/memberService.js'
import { formatDate } from '../../utils/format.js'

const uid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Date.now() + '-' + Math.random()

const EXAMPLES = [
  'Show the dashboard summary.',
  'Which books have fewer than 5 copies?',
  'Show overdue books.',
  'Add 5 copies of a book.',
  'Show today’s transactions.',
  'List all issued books.',
]

function buildHistory(messages) {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }))
}

/*
 * Apply only filters that are explicitly present in the user's request.
 * This is intentionally conservative: the frontend never invents a filter.
 */
function applyBookQueryFilter(books, query = '') {
  const q = query.toLowerCase()

  const match = q.match(
    /(?:fewer|less|under|below)\s+than\s+(\d+)\s+copies|\b(?:under|below)\s+(\d+)\s+copies/
  )

  const threshold = Number(match?.[1] ?? match?.[2])

  if (!Number.isFinite(threshold)) return books

  return books.filter((book) => {
    const available =
      book.available_quantity ??
      book.available ??
      book.available_copies ??
      book.quantity_available ??
      book.quantity ??
      0

    return Number(available) < threshold
  })
}

function formatToolResults(tools, userQuery = '', books = [], members = []) {
  if (!tools || tools.length === 0) return null

  // Detect query intent from user's question
  const q = userQuery.toLowerCase()
  const isOverdueQuery = /\b(overdue|past due|late)\b/.test(q)
  const isIssuedQuery = /\b(issued|currently issued|checked out|on loan)\b/.test(q) && !isOverdueQuery
  const isLowStockQuery = /\b(fewer|less|under|below)\s+(?:than\s+)?\d+\s+cop?y/.test(q) || /\b(low stock|out of stock)\b/.test(q)
  const isTransactionQuery = isOverdueQuery || isIssuedQuery

  const formatted = []

  for (const tool of tools) {
    if (!tool?.success) continue

    const result = tool.result
    if (result == null || result === '') continue

    try {
      const parsed = typeof result === 'string' ? JSON.parse(result) : result

      // ---------------- Dashboard ----------------
      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        (
          parsed.total_books !== undefined ||
          parsed.books_available !== undefined ||
          parsed.books_issued !== undefined ||
          parsed.total_members !== undefined ||
          parsed.overdue_books !== undefined
        )
      ) {
        formatted.push({
          type: 'dashboard',
          title: 'Library Dashboard',
          data: [
            {
              label: 'Total Books',
              value: parsed.total_books ?? 0,
              color: 'primary',
              icon: <MenuBookOutlinedIcon fontSize="small" />,
            },
            {
              label: 'Available',
              value: parsed.books_available ?? 0,
              color: 'success',
              icon: <CheckCircleOutlineIcon fontSize="small" />,
            },
            {
              label: 'Issued',
              value: parsed.books_issued ?? 0,
              color: 'warning',
              icon: <SwapHorizOutlinedIcon fontSize="small" />,
            },
            {
              label: 'Members',
              value: parsed.total_members ?? 0,
              color: 'info',
              icon: <GroupOutlinedIcon fontSize="small" />,
            },
            {
              label: 'Overdue',
              value: parsed.overdue_books ?? 0,
              color: 'error',
              icon: <WarningAmberOutlinedIcon fontSize="small" />,
            },
          ],
          insights: Array.isArray(parsed.insights) ? parsed.insights : [],
          activities: Array.isArray(parsed.activities) ? parsed.activities : [],
          todayTransactions: parsed.today_transactions ?? 0,
        })
        continue
      }

      // ---------------- Single book ----------------
      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        parsed.title &&
        parsed.author
      ) {
        formatted.push({
          type: 'book',
          title: 'Book Details',
          data: normalizeBook(parsed),
        })
        continue
      }

      // ---------------- Single member ----------------
      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        parsed.name &&
        parsed.email
      ) {
        formatted.push({
          type: 'member',
          title: 'Member Details',
          data: parsed,
        })
        continue
      }

      // ---------------- Success/message ----------------
      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        parsed.message
      ) {
        formatted.push({
          type: 'message',
          title: 'Success',
          message: parsed.message,
        })
        continue
      }

      // ---------------- Arrays ----------------
      if (Array.isArray(parsed)) {
        const first = parsed[0]

        // Books - check BEFORE generic empty check
        if (first?.title && first?.author && !isTransactionQuery) {
          const filteredBooks = applyBookQueryFilter(parsed, userQuery)

          formatted.push({
            type: 'books',
            title:
              filteredBooks.length === 1
                ? '1 matching book'
                : `${filteredBooks.length} matching books`,
            data: filteredBooks.map(normalizeBook),
            filteredByQuery: filteredBooks.length !== parsed.length,
            originalCount: parsed.length,
          })
          continue
        }

        // Members - check BEFORE generic empty check
        if (first?.name && first?.email && !isTransactionQuery) {
          formatted.push({
            type: 'members',
            title:
              parsed.length === 1
                ? '1 member'
                : `${parsed.length} members`,
            data: parsed,
          })
          continue
        }

        // Transactions - joined data - check BEFORE generic empty check
        if (first?.bookTitle && first?.memberName) {
          let filtered = parsed.map((t) => ({
            book: t.bookTitle,
            member: t.memberName,
            status: t.status,
            dueDate: t.dueDate,
            fine: t.fine ?? 0,
            overdue: Boolean(t.overdue),
          }))

          if (isOverdueQuery) {
            filtered = filtered.filter((t) => t.overdue === true)
          } else if (isIssuedQuery) {
            filtered = filtered.filter((t) => t.status === 'Issued')
          }

          if (filtered.length > 0) {
            formatted.push({
              type: 'transactions',
              title:
                filtered.length === 1
                  ? '1 transaction'
                  : `${filtered.length} transactions`,
              data: filtered,
            })
          } else if (isOverdueQuery || isIssuedQuery) {
            formatted.push({
              type: 'message',
              title: isOverdueQuery ? 'No overdue books found' : 'No issued books found',
              message: isOverdueQuery
                ? 'There are currently no overdue books.'
                : 'There are currently no books issued.',
            })
          }
          continue
        }

        // Raw transactions from list_transactions tool - check BEFORE generic empty check
        if (first?.book_id && first?.member_id) {
          const bookMap = new Map((books || []).map((b) => [b.id, b]))
          const memberMap = new Map((members || []).map((m) => [m.id, m]))

          const enriched = parsed.map((t) => {
            const book = bookMap.get(t.book_id)
            const member = memberMap.get(t.member_id)
            return {
              book: book?.title ?? 'Unknown Book',
              member: member?.name ?? 'Unknown Member',
              status: t.status ?? 'Unknown',
              issueDate: t.issue_date,
              dueDate: t.due_date,
              returnDate: t.return_date,
              fine: t.fine ?? 0,
              overdue: t.status === 'Issued' && t.due_date ? new Date(t.due_date) < new Date() : false,
            }
          })

          let filtered = enriched
          if (isOverdueQuery) {
            filtered = enriched.filter((t) => t.overdue === true)
          } else if (isIssuedQuery) {
            filtered = enriched.filter((t) => t.status === 'Issued')
          }

          if (filtered.length > 0) {
            formatted.push({
              type: 'transactions',
              title:
                filtered.length === 1
                  ? '1 transaction'
                  : `${filtered.length} transactions`,
              data: filtered,
            })
          } else if (isOverdueQuery || isIssuedQuery) {
            formatted.push({
              type: 'message',
              title: isOverdueQuery ? 'No overdue books found' : 'No issued books found',
              message: isOverdueQuery
                ? 'There are currently no overdue books.'
                : 'There are currently no books issued.',
            })
          }
          continue
        }

        // Empty arrays need an explicit response for transaction queries.
        // Otherwise the tool result disappears and the raw AI reply becomes
        // the only visible response ("No records found", etc.).
        if (parsed.length === 0) {
          if (isOverdueQuery) {
            formatted.push({
              type: 'message',
              title: 'No overdue books found',
              message: 'There are currently no overdue books.',
            })
          } else if (isIssuedQuery) {
            formatted.push({
              type: 'message',
              title: 'No issued books found',
              message: 'There are currently no books issued.',
            })
          } else {
            formatted.push({
              type: 'message',
              title: 'No results',
              message: 'No matching records were found.',
            })
          }
          continue
        }

        // Generic array - suppress for transaction queries
        if (!isTransactionQuery) {
          formatted.push({
            type: 'list',
            title:
              parsed.length === 1
                ? '1 result'
                : `${parsed.length} results`,
            data: parsed,
          })
        }
        continue
      }// ---------------- Generic object ----------------
      if (parsed && typeof parsed === 'object' && !isTransactionQuery) {
        formatted.push({
          type: 'object',
          title: 'Result',
          data: parsed,
        })
      }
    } catch (e) {
      console.warn('Failed to parse tool result:', e, result)

      formatted.push({
        type: 'object',
        title: 'Result',
        data: result,
      })
    }
  }

  return formatted.length > 0 ? formatted : null
}

function normalizeBook(book) {
  return {
    ...book,
    title: book.title ?? 'Untitled',
    author: book.author ?? 'Unknown author',
    category: book.category ?? 'Uncategorized',
    available:
      book.available_quantity ??
      book.available ??
      book.available_copies ??
      book.quantity_available ??
      0,
    total: book.quantity ?? book.total_quantity ?? book.total ?? 0,
  }
}

/*
 * Tool cards are the authoritative visual representation of structured
 * results. If the model repeats a huge list in plain text, keep only a
 * short summary so the user doesn't see the same data twice.
 */

const MarkdownMessage = ({ content }) => {
  if (!content) return null

  return (
    <Box
      sx={{
        fontSize: '0.95rem',
        lineHeight: 1.7,
        color: 'text.primary',

        '& p': {
          margin: '0 0 10px 0',
        },

        '& p:last-child': {
          marginBottom: 0,
        },

        '& strong': {
          fontWeight: 700,
        },

        '& em': {
          fontStyle: 'italic',
        },

        '& h1, & h2, & h3, & h4, & h5, & h6': {
          fontWeight: 700,
          margin: '12px 0 8px',
          lineHeight: 1.3,
        },

        '& h1': {
          fontSize: '1.4rem',
        },

        '& h2': {
          fontSize: '1.25rem',
        },

        '& h3': {
          fontSize: '1.1rem',
        },

        '& ul, & ol': {
          margin: '6px 0 10px',
          paddingLeft: '24px',
        },

        '& li': {
          marginBottom: '4px',
        },

        '& code': {
          backgroundColor: 'rgba(127, 127, 127, 0.15)',
          borderRadius: '4px',
          padding: '2px 5px',
          fontFamily: 'monospace',
          fontSize: '0.9em',
        },

        '& pre': {
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '8px',
          padding: '12px',
          overflowX: 'auto',
          margin: '10px 0',
        },

        '& pre code': {
          backgroundColor: 'transparent',
          padding: 0,
        },

        '& blockquote': {
          margin: '10px 0',
          paddingLeft: '14px',
          borderLeft: '3px solid',
          borderColor: 'primary.main',
          color: 'text.secondary',
        },

        '& hr': {
          border: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          margin: '14px 0',
        },

        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          margin: '12px 0',
        },

        '& th, & td': {
          border: '1px solid',
          borderColor: 'divider',
          padding: '8px 10px',
          textAlign: 'left',
        },

        '& th': {
          fontWeight: 700,
          backgroundColor: 'action.hover',
        },

        '& a': {
          color: 'primary.main',
          textDecoration: 'none',
        },

        '& a:hover': {
          textDecoration: 'underline',
        },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </Box>
  )
}
export default function AIAssistant() {
  const {
    messages,
    isLoading,
    error,
    suggestedPrompts,
    addMessage,
    setMessages,
    clearMessages,
    setError,
    clearError,
    setSuggestedPrompts,
  } = useAI()

  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [failedId, setFailedId] = useState(null)
  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const booksRef = useRef([])
  const membersRef = useRef([])
  const bottomRef = useRef(null)

  // Fetch books and members for transaction formatting (fire-and-forget)
  useEffect(() => {
    let cancelled = false
    Promise.all([getBooks(), getMembers()])
      .then(([booksData, membersData]) => {
        if (!cancelled) {
          setBooks(booksData || [])
          setMembers(membersData || [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBooks([])
          setMembers([])
        }
      })
    return () => { cancelled = true }
  }, [])

  // Keep refs in sync with state for formatToolResults
  booksRef.current = books
  membersRef.current = members

  const messagesRef = useRef(messages)
  const sendingRef = useRef(sending)
  const failedIdRef = useRef(failedId)
  const inputRef = useRef(input)

  messagesRef.current = messages
  sendingRef.current = sending
  failedIdRef.current = failedId
  inputRef.current = input

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }, [messages, sending])

  async function sendRequest(text, history, userId = null) {
    setSending(true)
    setError(null)
    setFailedId(null)

    try {
      const res = await sendChat(text, history)

      // Use refs for latest books/members - never block AI response on reference data loading
      const toolResults = formatToolResults(
        res.tool_results || [],
        text,
        booksRef.current,
        membersRef.current
      )

      addMessage({
        id: uid(),
        role: 'assistant',
        content: res.reply,
        toolResults,
      })
    } catch (err) {
      setError(getErrorMessage(err))
      setFailedId(userId)
    } finally {
      setSending(false)
    }
  }

  const handleSend = useCallback((overrideText) => {
    const text = String(overrideText ?? inputRef.current).trim()

    if (!text || sendingRef.current) return

    const id = uid()
    const history = buildHistory(messagesRef.current)

    addMessage({
      id,
      role: 'user',
      content: text,
    })

    setInput('')
    sendRequest(text, history, id)
  }, [])

  const handleRetry = useCallback(() => {
    if (!failedIdRef.current || sendingRef.current) return

    const failed = messagesRef.current.find(
      (m) => m.id === failedIdRef.current
    )

    if (!failed) return

    const history = buildHistory(
      messagesRef.current.filter(
        (m) => m.id !== failedIdRef.current
      )
    )

    setMessages((prev) =>
      prev.filter((m) => m.id !== failedIdRef.current)
    )

    sendRequest(failed.content, history)
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = useCallback(() => {
    clearMessages()
    clearError()
  }, [])

  useEffect(() => {
    if (suggestedPrompts.length === 0) {
      setSuggestedPrompts(EXAMPLES)
    }
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 160px)',
        minHeight: 460,
      }}
    >
      <PageHeader
        title="AI Assistant"
        subtitle="Your BookHive librarian copilot"
        actions={
          messages.length > 0 ? (
            <Button
              startIcon={<DeleteSweepOutlinedIcon />}
              onClick={clearChat}
              disabled={sending}
            >
              Clear conversation
            </Button>
          ) : null
        }
      />

      <Card
        sx={{
          flexGrow: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflowY: 'auto',
            p: { xs: 1.5, md: 2.5 },
          }}
        >
          {messages.length === 0 ? (
            <Box
              sx={{
                py: 5,
                px: 2,
                textAlign: 'center',
              }}
            >
              <Avatar
                sx={{
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  width: 52,
                  height: 52,
                }}
              >
                <AutoAwesomeOutlinedIcon />
              </Avatar>

              <Typography variant="h6" gutterBottom>
                How can I help manage the library?
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 3,
                  maxWidth: 520,
                  mx: 'auto',
                }}
              >
                Ask about your catalog, members, transactions and dashboard.
                BookHive AI can run library operations for you using live data.
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="center"
                mx={1}
                mb={2}
              >
                {EXAMPLES.map((ex) => (
                  <Button
                    key={ex}
                    variant="outlined"
                    size="small"
                    onClick={() => handleSend(ex)}
                    disabled={sending}
                    sx={{
                      maxWidth: { sm: 280 },
                      borderRadius: 2,
                    }}
                  >
                    {ex}
                  </Button>
                ))}
              </Stack>
            </Box>
          ) : (
            <Stack spacing={2}>
              {messages.map((msg) => {
                const isUser = msg.role === 'user'

                const structuredResults = Array.isArray(msg.toolResults)
                  ? msg.toolResults.filter(Boolean)
                  : []

                /*
                 * These tool results already have dedicated visual components.
                 * Therefore we should NOT also print the AI's raw Markdown version
                 * of the same data underneath/above them.
                 */
                // Tool cards are the canonical representation of tool output.
                // If a tool result exists, do not render the model's raw reply as a
                // second representation of the same data. This prevents duplicate
                // lists, IDs, "No records found" text, and generic summaries.
                const hasToolResults = structuredResults.length > 0

                // Filter generic completion sentences from AI responses.
                const filterGenericCompletion = (content) => {
                  if (!content) return ''
                  const genericPatterns = [
                    /^I completed the requested operations\. Please verify the results above\.\s*/i,
                    /^Operation completed\.\s*/i,
                    /^I have completed the requested operations\.\s*/i,
                    /^The operation has been completed\.\s*/i,
                    /^Request completed\.\s*/i,
                  ]

                  let filtered = content
                  for (const pattern of genericPatterns) {
                    filtered = filtered.replace(pattern, '')
                  }
                  return filtered.trim()
                }

                return (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      flexDirection: isUser ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      width: '100%',
                      mb: 2,
                    }}
                  >
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        flexShrink: 0,
                        bgcolor: isUser
                          ? 'primary.main'
                          : 'primary.light',
                        color: isUser
                          ? 'primary.contrastText'
                          : 'primary.dark',
                      }}
                    >
                      {isUser ? (
                        'U'
                      ) : (
                        <AutoAwesomeOutlinedIcon fontSize="small" />
                      )}
                    </Avatar>

                    {/* Message area */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start',
                        minWidth: 0,
                        maxWidth: {
                          xs: 'calc(100% - 50px)',
                          md: isUser ? '75%' : '90%',
                        },
                        flex: hasStructuredResult ? 1 : 'initial',
                      }}
                    >

                      {/* =========================
            USER MESSAGE
        ========================= */}
                      {isUser && (
                        <Box
                          sx={{
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            px: 2,
                            py: 1.2,
                            borderRadius: '18px 18px 4px 18px',
                            boxShadow: 2,
                            wordBreak: 'break-word',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.5,
                            }}
                          >
                            {msg.content}
                          </Typography>
                        </Box>
                      )}

                      {/* =========================
            AI MESSAGE
        ========================= */}
                      {!isUser && (
                        <>
                          {/* Structured tool results */}
                          {structuredResults.length > 0 && (
                            <Box
                              sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                              }}
                            >
                              {structuredResults.map((tr, index) => (
                                <ToolResultCard
                                  key={`${msg.id}-tool-${index}`}
                                  title={tr.title}
                                  type={tr.type}
                                  data={tr.data}
                                  message={tr.message}
                                  insights={tr.insights}
                                  activities={tr.activities}
                                  todayTransactions={tr.todayTransactions}
                                  filteredByQuery={tr.filteredByQuery}
                                  originalCount={tr.originalCount}
                                />
                              ))}
                            </Box>
                          )}

                          {/* 
                              The tool card is authoritative whenever a tool returned
                              structured output. Only show the model's plain-text/Markdown
                              reply when there is no tool result to render.
                            */}
                          {!hasToolResults && (() => {
                            const filtered = filterGenericCompletion(msg.content)
                            if (!filtered) return null

                            return (
                              <Box
                                sx={{
                                  backgroundColor: 'background.paper',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  borderRadius: '4px 18px 18px 18px',
                                  px: 2,
                                  py: 1.5,
                                  boxShadow: 1,
                                  width: 'fit-content',
                                  maxWidth: '100%',
                                }}
                              >
                                <MarkdownMessage content={filtered} />
                              </Box>
                            )
                          })()}
                          {msg.id === failedId && (
                            <Box
                              sx={{
                                mt: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                width: '100%',
                              }}
                            >
                              <Alert
                                severity="error"
                                sx={{
                                  flex: 1,
                                  borderRadius: 2,
                                }}
                              >
                                {error}
                              </Alert>

                              <Button
                                size="small"
                                color="primary"
                                onClick={handleRetry}
                                disabled={sending}
                              >
                                Retry
                              </Button>
                            </Box>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                )
              })}

              <div ref={bottomRef} />
            </Stack>
          )}

          {isLoading && (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>

        <Divider />

        <Box
          sx={{
            p: { xs: 1.5, md: 2 },
            bgcolor: 'background.default',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 1.5,
            }}
          >
            <TextField
              fullWidth
              multiline
              rows={1}
              maxRows={4}
              placeholder="Ask about books, members, transactions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              sx={{
                flexGrow: 1,
                minWidth: 0,
                '& .MuiInputBase-root': {
                  borderRadius: 3,
                },
              }}
            />

            <Button
              variant="contained"
              size="large"
              onClick={() => handleSend()}
              disabled={!input.trim() || sending}
              startIcon={
                sending ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendIcon />
                )
              }
              sx={{
                px: 3,
                whiteSpace: 'nowrap',
                borderRadius: 3,
              }}
            >
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  )
}
function formatLabel(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatValue(value) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
function ToolResultCard({
  title,
  type,
  data,
  message,
  insights = [],
  activities = [],
  todayTransactions = 0,
  filteredByQuery = false,
  originalCount = null,
}) {
  switch (type) {
    case 'books':
      return (
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
              sx={{ mb: 1.5 }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                {title}
              </Typography>

              {filteredByQuery && originalCount != null && (
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={`Filtered from ${originalCount}`}
                />
              )}
            </Stack>

            {data.length === 0 ? (
              <Alert severity="info">
                No books match this request.
              </Alert>
            ) : (
              <Stack spacing={1}>
                {data.map((item, idx) => (
                  <Card
                    key={`${item.title}-${idx}`}
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      borderColor: 'divider',
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 1.5,
                        '&:last-child': { pb: 1.5 },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                      >
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

                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Typography
                            fontWeight={700}
                            variant="body1"
                            sx={{ wordBreak: 'break-word' }}
                          >
                            {item.title}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ wordBreak: 'break-word' }}
                          >
                            {item.author}
                          </Typography>

                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            mt={1}
                          >
                            <Chip
                              size="small"
                              label={item.category}
                              variant="outlined"
                            />

                            <Chip
                              size="small"
                              color={
                                item.available > 0
                                  ? 'success'
                                  : 'error'
                              }
                              variant="outlined"
                              label={`${item.available} / ${item.total} available`}
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      )

    case 'book':
      return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {title}
            </Typography>

            <BookRow item={data} />
          </CardContent>
        </Card>
      )

    case 'members':
      return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {title}
            </Typography>

            <Stack spacing={1}>
              {data.map((member, idx) => (
                <Card key={idx} variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" spacing={1.5}>
                      <Avatar
                        sx={{
                          bgcolor: 'info.light',
                          color: 'info.dark',
                        }}
                      >
                        <GroupOutlinedIcon fontSize="small" />
                      </Avatar>

                      <Box>
                        <Typography fontWeight={700}>
                          {member.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.email}
                        </Typography>
                        {member.phone && (
                          <Typography variant="body2" color="text.secondary">
                            {member.phone}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )

    case 'transactions':
      return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {title}
            </Typography>

            <Stack spacing={1.5}>
              {data.map((item, idx) => (
                <Card key={idx} variant="outlined" sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" spacing={1.5}>
                      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', width: 44, height: 44 }}>
                        <MenuBookOutlinedIcon fontSize="medium" />
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontWeight={700} variant="h6" gutterBottom lineHeight={1.3}>
                          {item.book}
                        </Typography>

                        <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>👤 {item.member}</strong>
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            📅 Issued: <strong>{formatDate(item.issueDate)}</strong>
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            ⏰ Due: <strong>{formatDate(item.dueDate)}</strong>
                          </Typography>

                          {item.returnDate && (
                            <Typography variant="body2" color="text.secondary">
                              🔁 Returned: <strong>{formatDate(item.returnDate)}</strong>
                            </Typography>
                          )}

                          <Typography variant="body2" color="text.secondary">
                            💰 Fine: <strong>₹{Number(item.fine || 0).toFixed(2)}</strong>
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                          <Chip
                            size="small"
                            label={item.status}
                            color={
                              item.status === 'Issued' ? 'warning' : 'success'
                            }
                            icon={
                              item.status === 'Issued'
                                ? <SwapHorizOutlinedIcon fontSize="small" />
                                : <CheckCircleOutlineIcon fontSize="small" />
                            }
                          />

                          {item.overdue && (
                            <Chip
                              size="small"
                              label="Overdue"
                              color="error"
                              icon={<WarningAmberOutlinedIcon fontSize="small" />}
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )

    case 'dashboard':
      return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {title}
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  lg: 'repeat(5, 1fr)',
                },
                gap: 1.25,
              }}
            >
              {data.map((stat, idx) => (
                <StatCardSimple
                  key={idx}
                  label={stat.label}
                  value={stat.value}
                  color={stat.color}
                  icon={stat.icon}
                />
              ))}
            </Box>

            {(insights.length > 0 || todayTransactions !== 0) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Dashboard Summary
                </Typography>

                {todayTransactions !== 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Today’s transactions: {todayTransactions}
                  </Typography>
                )}

                {insights.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Insights / Low Stock Alerts
                    </Typography>

                    <Box component="ul" sx={{ mt: 0.5, pl: 2.5, mb: 0 }}>
                      {insights.map((insight, idx) => (
                        <Typography
                          component="li"
                          variant="body2"
                          key={idx}
                          sx={{ mb: 0.4 }}
                        >
                          {insight}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )

    case 'message':
      return (
        <Alert severity="success" sx={{ borderRadius: 2.5 }}>
          {message}
        </Alert>
      )

    case 'list':
    case 'object':
    default:
      // Handle string and null/undefined before attempting object/array operations
      if (typeof data === 'string') {
        return (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {data}
              </Typography>
            </CardContent>
          </Card>
        )
      }

      if (data == null) {
        return (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {title}
              </Typography>
              <Alert severity="info">No data returned.</Alert>
            </CardContent>
          </Card>
        )
      }

      return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {title}
            </Typography>

            {Array.isArray(data) ? (
              <Stack spacing={1}>
                {data.map((item, index) => (
                  <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="body2">
                        {typeof item === 'object'
                          ? Object.entries(item)
                            .map(([key, value]) => `${formatLabel(key)}: ${formatValue(value)}`)
                            .join(' • ')
                          : String(item)}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Stack spacing={1}>
                {Object.entries(data || {}).map(([key, value]) => (
                  <Box
                    key={key}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 2,
                      py: 0.75,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="text.secondary"
                    >
                      {formatLabel(key)}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ textAlign: 'right', wordBreak: 'break-word' }}
                    >
                      {formatValue(value)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      )
  }
}

function BookRow({ item }) {
  const book = normalizeBook(item)

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack direction="row" spacing={1.5}>
          <Avatar
            sx={{
              bgcolor: 'primary.light',
              color: 'primary.dark',
            }}
          >
            <MenuBookOutlinedIcon fontSize="small" />
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={700}>{book.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {book.author}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              <Chip
                size="small"
                label={book.category}
                variant="outlined"
              />
              <Chip
                size="small"
                color={book.available > 0 ? 'success' : 'error'}
                variant="outlined"
                label={`${book.available} / ${book.total} available`}
              />
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

function StatCardSimple({ label, value, color, icon }) {
  const palette = {
    primary: {
      bg: 'primary.light',
      fg: 'primary.dark',
    },
    success: {
      bg: 'success.light',
      fg: 'success.dark',
    },
    warning: {
      bg: 'warning.light',
      fg: 'warning.dark',
    },
    info: {
      bg: 'info.light',
      fg: 'info.dark',
    },
    error: {
      bg: 'error.light',
      fg: 'error.dark',
    },
  }

  const selected = palette[color] ?? palette.primary

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderRadius: 2.5,
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          p: 1.5,
          '&:last-child': { pb: 1.5 },
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: selected.bg,
            color: selected.fg,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
          >
            {label}
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {value ?? '—'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}