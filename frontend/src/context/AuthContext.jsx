import React, { createContext, useContext, useState, useEffect } from 'react'
 
const AuthContext = createContext(null)
 
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    fetch('http://localhost:3001/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setUser(data || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])
 
  async function logout() {
    await fetch('http://localhost:3001/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }
 
  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
 
export const useAuth = () => useContext(AuthContext)
 