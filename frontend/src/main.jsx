import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { ThemeContextProvider } from './context/ThemeContext.jsx'
import { NotebookContextProvider } from './context/NotebookContext.jsx'
import { registerSW } from 'virtual:pwa-register'

// Register service worker — auto-updates silently in the background
registerSW({
    onNeedRefresh() {
        // New content available — reload to get it
        // (could show a toast here if desired)
    },
    onOfflineReady() {
        console.log('Notary is ready to work offline');
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthContextProvider>
        <ThemeContextProvider>
          <NotebookContextProvider>
            <App />
          </NotebookContextProvider>
        </ThemeContextProvider>
      </AuthContextProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
