import './App.css'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import { useState } from 'react'

function App() {
  const [currentPage, setCurrentPage] = useState<'chat' | 'dashboard'>('chat')

  return (
    <div className="app">
      <nav className="navbar">
        <button 
          onClick={() => setCurrentPage('chat')}
          className={currentPage === 'chat' ? 'active' : ''}
        >
          Chat
        </button>
        <button 
          onClick={() => setCurrentPage('dashboard')}
          className={currentPage === 'dashboard' ? 'active' : ''}
        >
          Dashboard
        </button>
      </nav>

      <main>
        {currentPage === 'chat' && <Chat />}
        {currentPage === 'dashboard' && <Dashboard />}
      </main>
    </div>
  )
}

export default App
