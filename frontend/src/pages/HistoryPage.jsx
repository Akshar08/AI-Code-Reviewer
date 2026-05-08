import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
 
const scoreColor = s => s >= 7 ? '#34d399' : s >= 5 ? '#fbbf24' : '#f87171'
 
export default function HistoryPage({ onSelectReview, onNewReview }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/review/history`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setReviews(data.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }, [])
 
  return (
    <div style={{ padding: '32px 40px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Review History</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {user?.username} &nbsp;·&nbsp; {reviews.length} reviews
          </p>
        </div>
        <button onClick={onNewReview} style={{
          background: 'var(--accent)', color: 'white', border: 'none',
          borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--font-display)',
        }}>
          + New Review
        </button>
      </div>
 
      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 60 }}>
          Loading...
        </div>
      )}
 
      {!loading && reviews.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 80, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>📋</div>
          <p style={{ fontSize: 14 }}>No reviews yet. Submit your first one!</p>
        </div>
      )}
 
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {reviews.map(r => (
          <div
            key={r.id}
            onClick={() => onSelectReview(r.id)}
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '16px 20px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 16,
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {/* Score */}
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 16, fontWeight: 700,
              color: scoreColor(r.score), fontFamily: 'var(--font-display)',
            }}>
              {r.score}
            </div>
 
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{
                  fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 7px',
                  background: 'var(--bg-elevated)', borderRadius: 4, color: 'var(--accent)',
                  border: '1px solid var(--border)',
                }}>{r.language}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {r.summary || r.code_preview}
              </p>
            </div>
 
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}