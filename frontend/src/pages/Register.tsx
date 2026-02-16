import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { motion } from 'framer-motion'
import './Auth.css'

export default function Register() {
  const navigate = useNavigate()
  const { register, error, isLoading, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('')

  const checkPasswordStrength = (pass: string) => {
    if (pass.length < 6) return 'weak'
    if (pass.length < 10) return 'medium'
    if (pass.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)) return 'strong'
    return 'medium'
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (value) {
      setPasswordStrength(checkPasswordStrength(value))
    } else {
      setPasswordStrength('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (password !== confirmPassword) {
      alert('Пароли не совпадают')
      return
    }
    
    try {
      await register(email, username, password)
      navigate('/levels')
    } catch (err) {
      // Error handled by store
    }
  }

  return (
    <div className="auth-container">
      {/* Particles */}
      <div className="particles">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glitch"
        >
          РЕГИСТРАЦИЯ
        </motion.h1>
        
        <motion.p 
          className="auth-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Создание нового аккаунта
        </motion.p>
        
        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            ⚠ {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit}>
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@cyberspace.net"
              disabled={isLoading}
            />
          </motion.div>
          
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label>ИМЯ ПОЛЬЗОВАТЕЛЯ</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="CyberUser"
              disabled={isLoading}
            />
          </motion.div>
          
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <label>ПАРОЛЬ</label>
            <input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
              placeholder="••••••••••••"
              disabled={isLoading}
            />
            {password && (
              <motion.div 
                className={`password-strength ${passwordStrength}`}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </motion.div>
            )}
          </motion.div>
          
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <label>ПОДТВЕРЖДЕНИЕ ПАРОЛЯ</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              disabled={isLoading}
            />
          </motion.div>
          
          <motion.button 
            type="submit" 
            disabled={isLoading} 
            className={`btn-primary ${isLoading ? 'loading' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'ИНИЦИАЛИЗАЦИЯ...' : '◉ СОЗДАТЬ АККАУНТ'}
          </motion.button>
        </form>
        
        <motion.div 
          className="auth-link"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <Link to="/" className="back-link">
            ← Вернуться на главную
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
