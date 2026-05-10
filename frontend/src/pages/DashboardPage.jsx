import React, { useState } from 'react'
import Editor from '@monaco-editor/react'
import ReviewPanel from '../components/ReviewPanel.jsx'
import ChatPanel from '../components/ChatPanel.jsx'
import { useReview } from '../hooks/useReview.js'
import { useAuth } from '../context/AuthContext.jsx'

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c', 'cpp', 'ruby', 'php']

const DEFAULT_CODE = `// Paste your code here and click "Review Code"
function fetchUserData(userId) {
  var result = null;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.example.com/users/' + userId, false);
  xhr.send();
  if (xhr.status == 200) {
    result = JSON.parse(xhr.responseText);
  }
  return result;
}`

export default function DashboardPage({ onShowHistory }) {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [language, setLanguage] = useState('javascript')
  const [activeTab, setActiveTab] = useState('review') // 'review' | 'chat'
  const { result, loading, error, submit } = useReview()
  const { user, logout } = useAuth()

  const handleReview = () => {
    submit(code, language)
    setActiveTab('review')
  }

  const tabStyle = (tab) => ({
    padding: '6px 16px', fontSize: 12, fontFamily: 'var(--font-mono)',
    fontWeight: 500, cursor: 'pointer', border: 'none',
    borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
    background: 'transparent',
    color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
    transition: 'all 0.15s', letterSpacing: '0.04em',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56,
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 5l4 3-4 3M8 10h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>CodeReview AI</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)',
              padding: '6px 12px', fontSize: 13, fontFamily: 'var(--font-mono)',
              cursor: 'pointer', outline: 'none',
            }}
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <button onClick={handleReview} disabled={loading} style={{
            background: loading ? 'var(--bg-elevated)' : 'var(--accent)',
            color: loading ? 'var(--text-muted)' : 'white',
            border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '7px 18px', fontSize: 13, fontWeight: 600,
            fontFamily: 'var(--font-display)', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}>
            {loading ? 'Reviewing...' : 'Review Code →'}
          </button>

          <div style={{ width: '1px', height: 24, background: 'var(--border)' }} />

          <button onClick={onShowHistory} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)',
            padding: '6px 14px', fontSize: 13, cursor: 'pointer',
            fontFamily: 'var(--font-display)',
          }}>History</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {user?.avatarUrl && (
              <img src={user.avatarUrl} alt={user.username}
                style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)' }} />
            )}
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {user?.username}
            </span>
            <button onClick={logout} style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-mono)',
            }}>logout</button>
          </div>
        </div>
      </header>

      {/* Split layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left: Monaco Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>
          <div style={{
            padding: '8px 16px', fontSize: 11, color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ color: 'var(--accent)', fontSize: 8 }}>●</span>
            editor &nbsp;/&nbsp; {language}
          </div>
          <div style={{ flex: 1 }}>
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={val => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                tabSize: 2,
              }}
            />
          </div>
        </div>

        {/* Right: Tabs — Review + Chat */}
        <div style={{ width: 440, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)' }}>

          {/* Tab bar */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border)',
            background: 'var(--bg-surface)', paddingLeft: 8,
          }}>
            <button style={tabStyle('review')} onClick={() => setActiveTab('review')}>
              REVIEW
            </button>
            <button
              style={{
                ...tabStyle('chat'),
                display: 'flex', alignItems: 'center', gap: 6,
              }}
              onClick={() => setActiveTab('chat')}
            >
              CHAT
              {result && (
                <span style={{
                  fontSize: 9, background: 'var(--accent)', color: 'white',
                  borderRadius: 10, padding: '1px 5px', fontFamily: 'var(--font-mono)',
                }}>AI</span>
              )}
            </button>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activeTab === 'review' ? (
              <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                <ReviewPanel result={result} loading={loading} error={error} />
              </div>
            ) : (
              <ChatPanel
                reviewId={result?.id}
                code={code}
                reviewResult={result}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}