import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

console.log('[AgentZ Studio] Mounting app...')
try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('[AgentZ Studio] App mounted successfully')
} catch (e) {
  console.error('[AgentZ Studio] Mount error:', e)
  document.getElementById('root')!.innerHTML = `<div style="padding:40px;font-family:system-ui;color:#dc2626"><h2>Fehler beim Laden</h2><pre>${e}</pre></div>`
}
