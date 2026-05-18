import React, { useState, useEffect, useRef } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ position: 'relative', margin: '8px 0' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#0d1117', borderRadius: '6px 6px 0 0',
        padding: '4px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{ fontSize: 10, color: '#8888a8', fontFamily: 'var(--font-mono)' }}>{language || 'code'}</span>
        <button onClick={copy} style={{
          background: 'transparent', border: 'none', color: copied ? '#34d399' : '#8888a8',
          fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-mono)',
        }}>
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      <pre style={{
        background: '#0d1117', borderRadius: '0 0 6px 6px',
        padding: '12px', margin: 0, overflowX: 'auto',
        fontSize: 12, lineHeight: 1.6, color: '#e6edf3',
        fontFamily: 'var(--font-mono)',
      }}>{code}</pre>
    </div>
  )
}

function MessageContent({ content }) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const lines = part.slice(3, -3).split('\n')
          const language = lines[0].trim()
          const code = lines.slice(1).join('\n').trim()
          return <CodeBlock key={i} code={code} language={language} />
        }
        if (!part.trim()) return null
        // Render numbered lists nicely
        const lines = part.split('\n')
        return (
          <div key={i}>
            {lines.map((line, j) => {
              if (!line.trim()) return <div key={j} style={{ height: 6 }} />
              const isNumbered = /^\d+\./.test(line.trim())
              return (
                <p key={j} style={{
                  fontSize: 13, lineHeight: 1.75,
                  color: isNumbered ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)',
                  margin: 0,
                  paddingLeft: isNumbered ? 0 : 0,
                  fontWeight: isNumbered ? 500 : 400,
                }}>{line}</p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default function ChatPanel({ reviewId, code, reviewResult, onCodeUpdate }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!reviewId) { setLoadingHistory(false); return }
    const token = localStorage.getItem('token')
    fetch(`${API}/api/chat/${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setMessages(data.data || []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingHistory(false))
  }, [reviewId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/chat/${reviewId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: userMessage, code, reviewContext: reviewResult }),
      })
      const data = await res.json()
      if (data.success) {
        const { reply, shouldUpdateCode, updatedCode, changeSummary } = data.data
        setMessages(prev => [...prev, { role: 'assistant', content: reply }])

        if (shouldUpdateCode && updatedCode && typeof onCodeUpdate === 'function') {
          onCodeUpdate(updatedCode, changeSummary || 'Code updated by AI')
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  if (!reviewId) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', gap: 12, opacity: 0.4
      }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M6 12a3 3 0 013-3h18a3 3 0 013 3v12a3 3 0 01-3 3H9l-6 4V12z"
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        </svg>
        <p style={{
          fontSize: 13, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', textAlign: 'center'
        }}>
          Run a review first to<br/>start chatting about your code
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 20px',
        display: 'flex', flexDirection: 'column', gap: 16
      }}>
        {loadingHistory && (
          <p style={{
            fontSize: 12, color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', textAlign: 'center'
          }}>Loading history...</p>
        )}

        {!loadingHistory && messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Ask anything about your code!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Fix all the bugs in my code',
                'Make this code score a 10/10',
                'What does the critical bug mean?',
                'Improve the performance of this code',
              ].map(suggestion => (
                <button key={suggestion} onClick={() => setInput(suggestion)} style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 12px', color: 'var(--text-secondary)',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-display)',
                  textAlign: 'left', transition: 'border-color 0.15s',
                }}>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10,
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: msg.role === 'user' ? 'white' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}>
              {msg.role === 'user' ? 'U' : 'AI'}
            </div>
            <div style={{
              maxWidth: '85%',
              background: msg.role === 'user' ? 'var(--accent-dim)' : 'var(--bg-elevated)',
              border: `1px solid ${msg.role === 'user' ? 'var(--accent-glow)' : 'var(--border)'}`,
              borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
              padding: '10px 14px',
            }}>
              <MessageContent content={msg.content} />
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
            }}>AI</div>
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '4px 12px 12px 12px', padding: '12px 16px',
              display: 'flex', gap: 4, alignItems: 'center',
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)',
                  animation: 'pulse-glow 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: '12px 16px', borderTop: '1px solid var(--border)',
        display: 'flex', gap: 8, background: 'var(--bg-surface)',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
          }}
          placeholder="Ask about your code... (Enter to send)"
          rows={2}
          style={{
            flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
            borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)',
            fontSize: 13, fontFamily: 'var(--font-display)', resize: 'none',
            outline: 'none', lineHeight: 1.5,
          }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
          background: loading || !input.trim() ? 'var(--bg-elevated)' : 'var(--accent)',
          color: loading || !input.trim() ? 'var(--text-muted)' : 'white',
          border: 'none', borderRadius: 8, padding: '0 16px',
          fontSize: 18, fontWeight: 600,
          cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-display)', transition: 'all 0.2s', alignSelf: 'stretch',
        }}>
          {loading ? '...' : '↑'}
        </button>
      </div>
    </div>
  )
}