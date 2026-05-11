import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
 
function AppInner() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [selectedReviewId, setSelectedReviewId] = useState(null)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
              animation: 'pulse-glow 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }} />
          ))}
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  if (page === 'history') {
    return (
      <HistoryPage
        onSelectReview={(id) => {
          setSelectedReviewId(id)
          setPage('dashboard')
        }}
        onNewReview={() => {
          setSelectedReviewId(null)
          setPage('dashboard')
        }}
      />
    )
  }

  return (
    <DashboardPage
      onShowHistory={() => setPage('history')}
      selectedReviewId={selectedReviewId}
    />
  )
}
 
export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}