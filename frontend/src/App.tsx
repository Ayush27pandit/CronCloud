import './App.css'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto">
        <nav className="mb-8 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
            CronCloud
          </div>
        </nav>
        <Dashboard />
      </div>
    </div>
  )
}

export default App
