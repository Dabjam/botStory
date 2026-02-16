import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useEffect, useState } from 'react'
import { newsAPI } from '../services/api'
import { motion } from 'framer-motion'
import Robot3D from '../components/Robot3D'
import './Landing.css'

export default function Landing() {
  const { isAuthenticated } = useAuthStore()
  const [news, setNews] = useState<any[]>([])
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    newsAPI.getAll().then(res => setNews(res.data)).catch(() => {})
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="landing-container">
      {/* Animated particles background */}
      <div className="particles">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }} />
        ))}
      </div>

      {/* Floating orbs */}
      <motion.div 
        className="floating-orb orb-1"
        animate={{
          x: mousePosition.x * 0.02,
          y: mousePosition.y * 0.02,
        }}
        transition={{ type: 'spring', damping: 30 }}
      />
      <motion.div 
        className="floating-orb orb-2"
        animate={{
          x: mousePosition.x * -0.015,
          y: mousePosition.y * -0.015,
        }}
        transition={{ type: 'spring', damping: 30 }}
      />
      <motion.div 
        className="floating-orb orb-3"
        animate={{
          x: mousePosition.x * 0.01,
          y: mousePosition.y * 0.01,
        }}
        transition={{ type: 'spring', damping: 30 }}
      />

      {/* Hero section */}
      <section className="hero">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="hero-content"
        >
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className="badge-text">NEXT-GEN EDUCATION</span>
          </motion.div>

          <motion.h1 
            className="hero-title glitch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            АЛГОРИТМИЧЕСКИЙ
            <br />
            <span className="hero-title-accent">РОБОТ</span>
          </motion.h1>

          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Изучай программирование в киберпространстве будущего
            <br />
            Решай задачи. Управляй роботом. Становись мастером кода.
          </motion.p>

          <motion.div 
            className="hero-stats"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="stat-item">
              <div className="stat-value glow-text">∞</div>
              <div className="stat-label">Возможностей</div>
            </div>
            <div className="stat-item">
              <div className="stat-value glow-text">100%</div>
              <div className="stat-label">Интерактивность</div>
            </div>
            <div className="stat-item">
              <div className="stat-value glow-text">24/7</div>
              <div className="stat-label">Доступность</div>
            </div>
          </motion.div>

          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            {isAuthenticated ? (
              <Link to="/levels" className="btn btn-primary">
                <span className="btn-icon">▶</span>
                НАЧАТЬ МИССИЮ
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  <span className="btn-icon">◉</span>
                  ИНИЦИАЛИЗАЦИЯ
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  <span className="btn-icon">◈</span>
                  ВХОД В СИСТЕМУ
                </Link>
              </>
            )}
          </motion.div>

          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <div className="scroll-line"></div>
            <div className="scroll-text">SCROLL</div>
          </motion.div>
        </motion.div>

        {/* 3D Robot with Three.js */}
        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <Robot3D />
        </motion.div>
      </section>

      {/* Features section */}
      <section className="features">
        <motion.h2
          className="section-title glitch"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          СИСТЕМНЫЕ ВОЗМОЖНОСТИ
        </motion.h2>

        <div className="features-grid">
          {[
            {
              icon: '⚡',
              title: 'ИГРОВОЙ ДВИЖОК',
              desc: 'Решай задачи, управляя роботом на изометрической 3D-карте в реальном времени',
              color: 'var(--primary)'
            },
            {
              icon: '💻',
              title: 'ЯЗЫК КУМИР',
              desc: 'Изучай программирование на понятном русском языке с подсветкой синтаксиса',
              color: 'var(--secondary)'
            },
            {
              icon: '📊',
              title: 'УМНЫЙ АНАЛИЗ',
              desc: 'Получай мгновенную обратную связь и сравнивай своё решение с оптимальным',
              color: 'var(--accent)'
            },
            {
              icon: '📖',
              title: 'ЦИФРОВОЙ ДНЕВНИК',
              desc: 'Сохраняй важные заметки, выделяй ключевые моменты в предысториях',
              color: 'var(--warning)'
            },
            {
              icon: '💬',
              title: 'СОЦИАЛЬНАЯ СЕТЬ',
              desc: 'Обсуждай решения с другими игроками в чатах уровней',
              color: 'var(--primary)'
            },
            {
              icon: '🎯',
              title: 'СИСТЕМА ПРОГРЕССА',
              desc: 'Отслеживай свои достижения, получай статистику и улучшай навыки',
              color: 'var(--secondary)'
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="feature-card glass-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: `0 0 30px ${feature.color}80`
              }}
            >
              <div className="feature-icon" style={{ 
                textShadow: `0 0 20px ${feature.color}`
              }}>
                {feature.icon}
              </div>
              <h3 className="feature-title" style={{ color: feature.color }}>
                {feature.title}
              </h3>
              <p className="feature-desc">{feature.desc}</p>
              <div className="feature-line" style={{ background: feature.color }}></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* News section */}
      {news.length > 0 && (
        <section className="news-section">
          <motion.h2
            className="section-title glitch"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            ТРАНСЛЯЦИИ СИСТЕМЫ
          </motion.h2>

          <div className="news-grid">
            {news.map((item, i) => (
              <motion.div
                key={item.id}
                className="news-card glass-card"
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ 
                  y: -10,
                  boxShadow: '0 0 40px rgba(0, 255, 159, 0.4)'
                }}
              >
                <div className="news-header">
                  <span className="news-badge">НОВОСТЬ</span>
                  <span className="news-date">
                    {new Date(item.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <h3 className="news-title">{item.title}</h3>
                <p className="news-content">
                  {item.content.substring(0, 150)}...
                </p>
                <div className="news-footer">
                  <button className="btn-link">ЧИТАТЬ ДАЛЕЕ →</button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA section */}
      <motion.section 
        className="cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="cta-content glass-card">
          <h2 className="cta-title glitch">ГОТОВ НАЧАТЬ?</h2>
          <p className="cta-text">
            Присоединяйся к тысячам учеников, которые уже осваивают программирование
            <br />
            в самой футуристичной образовательной платформе
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-primary btn-large">
              <span className="btn-icon">◉</span>
              ЗАПУСТИТЬ ИНИЦИАЛИЗАЦИЮ
            </Link>
          )}
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="glitch">АЛГОРИТМИЧЕСКИЙ РОБОТ</span>
          </div>
          <div className="footer-links">
            <a href="#">О проекте</a>
            <a href="#">Документация</a>
            <a href="#">Поддержка</a>
            <a href="#">GitHub</a>
          </div>
          <div className="footer-copy">
            <p>© 2026 Algorithmic Robot. Все права защищены.</p>
            <p className="text-secondary">Powered by Future Technologies</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
