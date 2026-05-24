import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const SESSION_KEY = 'codereview_session'

export function useReview() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [duplicateData, setDuplicateData] = useState(null) // holds duplicate review if found

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed?.result) setResult(parsed.result)
      } catch {}
    }
  }, [])

  // Save session whenever result changes
  useEffect(() => {
    if (result) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ result }))
    }
  }, [result])

  async function submit(code, language) {
    if (!code || code.trim().length < 5) {
      setError('Please enter some code first.')
      return
    }
    setLoading(true)
    setError(null)
    setDuplicateData(null)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, language }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      if (data.duplicate) {
        // Don't set result yet — let user decide via popup
        setDuplicateData(data.data)
        setLoading(false)
        return
      }

      setResult(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function clearDuplicate() {
    setDuplicateData(null)
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY)
    setResult(null)
  }

  return { result, loading, error, submit, setResult, duplicateData, clearDuplicate, clearSession }
}