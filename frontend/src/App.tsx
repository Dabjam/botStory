import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import LevelHub from './pages/LevelHub'
import GamePlay from './pages/GamePlay'
import Briefing from './pages/Briefing'
import Profile from './pages/Profile'
import AdminPanel from './pages/AdminPanel'
import Layout from './components/Layout'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<Layout />}>
          <Route 
            path="/levels" 
            element={isAuthenticated ? <LevelHub /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/level/:id/briefing" 
            element={isAuthenticated ? <Briefing /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/level/:id/play" 
            element={isAuthenticated ? <GamePlay /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/levels" />} 
          />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
