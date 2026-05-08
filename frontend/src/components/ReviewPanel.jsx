import React from 'react'
import ScoreRing from './ScoreRing.jsx'

const sevConfig = {
  critical: { color: 'var(--red)', bg: 'var(--red-dim)', label: 'CRITICAL' },
  warning:  { color: 'var(--amber)', bg: 'var(--amber-dim)', label: 'WARNING' },
  info:     { color: 'var(--accent)', bg: 'var(--accent-dim)', label: 'INFO' },
}

const catColors = {
  performance:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  readability:    { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  security:       { color: 'var(--red)', bg: 'var(--red-dim)' },
  'best-practices': { color: 'var(--green)', bg: 'var(--green-dim)' },
}

function SectionHeader({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{children}</span>
      <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
    </div>
  )
}

export default function ReviewPanel({ result, loading, error }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)',
              animation: 'pulse-glow 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`
            }} />
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Analyzing your code...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', padding: '16px 20px', maxWidth: 320 }}>
          <p style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, opacity: 0.4 }}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="6" y="10" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M13 17l5 4-5 4M21 25h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Results will appear here</p>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fadeUp 0.4s ease', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Score + Summary */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        <ScoreRing score={result.score} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {result.language} &nbsp;·&nbsp; {result.tokensUsed} tokens
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.summary}</p>
        </div>
      </div>

      {/* Bugs */}
      {result.bugs?.length > 0 && (
        <div>
          <SectionHeader>Bugs & Issues ({result.bugs.length})</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.bugs.map((bug, i) => {
              const cfg = sevConfig[bug.severity] || sevConfig.info
              return (
                <div key={i} style={{ background: 'var(--bg-elevated)', border: `1px solid ${cfg.color}22`, borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: cfg.bg, color: cfg.color, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>{cfg.label}</span>
                    {bug.line && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>line {bug.line}</span>}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{bug.message}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>→ {bug.fix}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Improvements */}
      {result.improvements?.length > 0 && (
        <div>
          <SectionHeader>Improvements</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.improvements.map((imp, i) => {
              const cfg = catColors[imp.category] || catColors['best-practices']
              return (
                <div key={i} style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: cfg.bg, color: cfg.color, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{imp.category}</span>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 8 }}>{imp.message}</p>
                  {imp.example && (
                    <pre style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', background: 'var(--bg)', padding: '8px 10px', borderRadius: 6, overflowX: 'auto', lineHeight: 1.6 }}>{imp.example}</pre>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Positives */}
      {result.positives?.length > 0 && (
        <div>
          <SectionHeader>What's Good</SectionHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {result.positives.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--green)', fontSize: 14, marginTop: 1 }}>✓</span>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        reviewed at {new Date(result.reviewedAt).toLocaleTimeString()}
      </div>
    </div>
  )
}
