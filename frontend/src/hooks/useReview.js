import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function useReview() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function submit(code, language) {
    if (!code || code.trim().length < 5) {
      setError('Please enter some code first.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)

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
      setResult(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, error, submit, setResult }
}