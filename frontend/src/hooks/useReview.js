import { useState } from 'react'
 
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
      const res = await fetch('http://localhost:3001/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // sends session cookie
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
 
  return { result, loading, error, submit }
}