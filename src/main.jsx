import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

function applyInitialTheme() {
  try {
    const t = localStorage.getItem('rq_theme') || 'system'
    const dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', dark)
  } catch (e) {
    /* ignore */
  }
}

applyInitialTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)