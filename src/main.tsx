import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error) { console.error('[AgentZ Studio] Render error:', error) }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', background: '#fafafa' }}>
          <div style={{ maxWidth: 480, padding: 40, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#fff', fontWeight: 700, fontSize: 20 }}>A</div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Etwas ist schiefgelaufen</h2>
            <p style={{ fontSize: 14, color: '#737373', marginBottom: 24 }}>Die App konnte nicht geladen werden. Bitte lade die Seite neu.</p>
            <button onClick={() => window.location.reload()} style={{ height: 40, padding: '0 20px', borderRadius: 10, background: '#0a0a0a', color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Seite neu laden</button>
            <details style={{ marginTop: 24, textAlign: 'left' }}>
              <summary style={{ fontSize: 12, color: '#a3a3a3', cursor: 'pointer' }}>Technische Details</summary>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#dc2626', marginTop: 8, background: '#fef2f2', padding: 12, borderRadius: 8 }}>{this.state.error.message}</pre>
            </details>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
