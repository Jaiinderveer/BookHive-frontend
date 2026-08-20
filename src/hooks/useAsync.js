import { useCallback, useEffect, useState } from 'react'

// Small data-loading hook used by data-driven pages.
// Handles loading / success / error state + manual reload.
// loader must be stable (e.g. useCallback) so the effect only re-runs when its
// dependencies change; pass a new loader to trigger a refetch automatically.
export function useAsync(loader, options = {}) {
  const { immediate = true } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)
  const [requestId, setRequestId] = useState(0)

  useEffect(() => {
    if (!immediate) return undefined
    let cancelled = false
    loader()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [loader, requestId, immediate])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    setRequestId((id) => id + 1)
  }, [])

  return { data, loading, error, reload, setData }
}
