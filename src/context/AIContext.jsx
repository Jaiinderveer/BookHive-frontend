import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'

const AIContext = createContext(null)

// Version the storage key so old/broken conversation data
// doesn't get mixed with the new message format.
const AI_STORAGE_KEY = 'bookhive_ai_messages_v2'

function loadStoredMessages() {
  try {
    const stored = localStorage.getItem(AI_STORAGE_KEY)

    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      return []
    }

    // Keep only valid message objects.
    return parsed.filter(
      (message) =>
        message &&
        typeof message === 'object' &&
        typeof message.role === 'string' &&
        typeof message.content === 'string'
    )
  } catch (error) {
    console.warn('Failed to load AI conversation:', error)
    return []
  }
}

function AIProvider({ children }) {
  const [messages, setMessages] = useState(loadStoredMessages)

  const [isLoading, setIsLoading] = useState(false)

  const [error, setError] = useState(null)

  const [suggestedPrompts, setSuggestedPrompts] = useState([])

  // Persist conversation.
  useEffect(() => {
    try {
      localStorage.setItem(
        AI_STORAGE_KEY,
        JSON.stringify(messages)
      )
    } catch (error) {
      console.warn('Failed to save AI conversation:', error)
    }
  }, [messages])

  // Add a message to the conversation.
  const addMessage = useCallback((message) => {
    if (!message || typeof message !== 'object') {
      return
    }

    setMessages((prev) => {
      const newMessage = {
        ...message,
        id:
          message.id ||
          `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }

      return [...prev, newMessage]
    })
  }, [])

  // Supports both:
  // setMessages([...])
  // and
  // setMessages(prev => [...prev, ...])
  const setMessagesState = useCallback((value) => {
    setMessages(value)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)

    // Also immediately clear persisted conversation.
    try {
      localStorage.removeItem(AI_STORAGE_KEY)
    } catch {
      // Ignore storage errors.
    }
  }, [])

  const setErrorState = useCallback((err) => {
    setError(err)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const setSuggestedPromptsState = useCallback((prompts) => {
    setSuggestedPrompts(
      Array.isArray(prompts) ? prompts : []
    )
  }, [])

  const value = {
    messages,
    isLoading,
    error,
    suggestedPrompts,

    addMessage,

    setMessages: setMessagesState,

    clearMessages,

    setError: setErrorState,

    clearError,

    setSuggestedPrompts: setSuggestedPromptsState,

    // Available if you later want the provider itself
    // to control loading state.
    setIsLoading,
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const ctx = useContext(AIContext)

  if (!ctx) {
    throw new Error(
      'useAI must be used within an AIProvider'
    )
  }

  return ctx
}

export default AIProvider