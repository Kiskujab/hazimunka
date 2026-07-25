import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './styles.css'

// Ez a belépési pont: ide "kapcsoljuk be" a React alkalmazást
// az index.html-ben lévő <div id="root"></div> elembe.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Az AuthProvider mindenhol elérhetővé teszi a bejelentkezett usert */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
