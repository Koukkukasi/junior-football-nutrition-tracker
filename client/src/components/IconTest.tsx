import { CheckCircle, UtensilsCrossed, TrendingUp } from 'lucide-react'

export default function IconTest() {
  return (
    <div style={{ padding: '20px', background: 'white' }}>
      <h2>Icon Test</h2>
      <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
        <div>
          <p>CheckCircle (size 24):</p>
          <CheckCircle size={24} />
        </div>
        <div>
          <p>UtensilsCrossed (size 32):</p>
          <UtensilsCrossed size={32} />
        </div>
        <div>
          <p>TrendingUp (className):</p>
          <TrendingUp className="w-8 h-8" />
        </div>
        <div>
          <p>Direct SVG test:</p>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
      </div>
    </div>
  )
}