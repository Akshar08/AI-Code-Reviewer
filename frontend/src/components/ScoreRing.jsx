import React from 'react'

const colorMap = {
  high: '#34d399',
  mid: '#fbbf24',
  low: '#f87171',
}

export default function ScoreRing({ score }) {
  const color = score >= 7 ? colorMap.high : score >= 5 ? colorMap.mid : colorMap.low
  const pct = (score / 10) * 100
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
        <circle
          cx="45" cy="45" r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ * 0.25}
          style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="45" y="49" textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize="22" fontWeight="600" fontFamily="'Syne', sans-serif">
          {score}
        </text>
      </svg>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
        OUT OF 10
      </span>
    </div>
  )
}
