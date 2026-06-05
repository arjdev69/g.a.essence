import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AppProviders } from './app/AppProviders.tsx'
import { registerServiceWorker } from './features/pwa/registerServiceWorker.ts'
import './index.css'
import App from './App.tsx'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProviders>
  </StrictMode>,
)
