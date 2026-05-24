import React from 'react'

export default function DuplicateReviewModal({ review, onGoToExisting, onCreateNew, onClose }) {
  if (!review) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeUp 0.2s ease',
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 16, padding: '32px 28px',
        width: 420, maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 7v4m0 4h.01M21 11a10 10 0 11-20 0 10 10 0 0120 0z"
              stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h2 style={{
          fontSize: 17, fontWeight: 700, marginBottom: 8,
          letterSpacing: '-0.02em', color: 'var(--text-primary)',
        }}>
          We've seen this code before
        </h2>

        <p style={{
          fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.65,
        }}>
          You reviewed this exact code on{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            {new Date(review.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </strong>
          {' '}and scored <strong style={{ color: 'var(--accent)' }}>{review.score}/10</strong>.
          Would you like to go to that review?
        </p>

        {/* Previous review summary card */}
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '12px 14px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 18, fontWeight: 700, color: 'var(--accent)',
              fontFamily: 'var(--font-display)',
            }}>{review.score}<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/10</span></span>
            <span style={{
              fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
              padding: '2px 7px', background: 'var(--bg-surface)',
              border: '1px solid var(--border)', borderRadius: 4,
            }}>{review.language}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            {review.summary?.slice(0, 120)}{review.summary?.length > 120 ? '...' : ''}
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onGoToExisting}
            style={{
              flex: 1, padding: '10px', background: 'var(--accent)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}
          >
            Yes, take me there
          </button>
          <button
            onClick={onCreateNew}
            style={{
              flex: 1, padding: '10px', background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)', border: '1px solid var(--border)',
              borderRadius: 10, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--font-display)',
            }}
          >
            No, create new
          </button>
        </div>
      </div>
    </div>
  )
}