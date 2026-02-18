import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { levelAPI, userAPI } from '../services/api'
import { motion } from 'framer-motion'
import './LevelHub.css'

interface Level {
  id: number
  title: string
  description: string
  order: number
  difficulty: number
  is_active: boolean
}

export default function LevelHub() {
  const [levels, setLevels] = useState<Level[]>([])
  const [progressMap, setProgressMap] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all')

  useEffect(() => {
    Promise.all([levelAPI.getAll(), userAPI.getLevelProgress()])
      .then(([levelsRes, progressRes]) => {
        setLevels(levelsRes.data)
        const map: Record<number, boolean> = {}
        ;(progressRes.data || []).forEach((p: { level_id: number; completed: boolean }) => {
          map[p.level_id] = p.completed
        })
        setProgressMap(map)
      })
      .catch(err => {
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredLevels = useMemo(() => {
    if (filter === 'all') return levels
    if (filter === 'completed') return levels.filter(l => progressMap[l.id])
    return levels.filter(l => !progressMap[l.id])
  }, [levels, filter, progressMap])

  if (loading) {
    return (
      <div className="level-hub">
        <div className="loading">
          <div className="spinner"></div>
          <div className="loading-text">ЗАГРУЗКА УРОВНЕЙ...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="level-hub">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glitch"
      >
        ВЫБОР МИССИИ
      </motion.h1>

      {levels.length > 0 && (
        <motion.div 
          className="level-controls"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="filter-group">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              ◉ ВСЕ УРОВНИ
            </button>
            <button 
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              ▶ АКТИВНЫЕ
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              ✓ ПРОЙДЕННЫЕ
            </button>
          </div>
          <div className="level-count">
            <span className="glow-text">{filteredLevels.length}</span> {filter === 'all' ? 'доступных миссий' : filter === 'completed' ? 'пройдено' : 'в процессе'}
          </div>
        </motion.div>
      )}
      
      <div className="levels-grid">
        {filteredLevels.map((level, i) => (
          <motion.div
            key={level.id}
            className="level-card"
            initial={{ opacity: 0, y: 50, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ 
              delay: 0.1 * i,
              duration: 0.6,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.03,
              transition: { duration: 0.2 }
            }}
          >
            {/* Isometric 3D Preview */}
            <div className="level-card-header">
              <div className="level-isometric-preview">
                <div className="iso-cube">
                  <div className="iso-face front"></div>
                  <div className="iso-face back"></div>
                  <div className="iso-face top"></div>
                  <div className="iso-face bottom"></div>
                  <div className="iso-face left"></div>
                  <div className="iso-face right"></div>
                </div>
              </div>
              
              {/* Status indicator: пройден или доступен */}
              <motion.div 
                className={`level-status ${progressMap[level.id] ? 'completed' : 'active'}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 * i, type: "spring" }}
              >
                {progressMap[level.id] ? '✓' : '▶'}
              </motion.div>
            </div>

            <div className="level-card-body">
              <motion.div 
                className="level-number"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + 0.1 * i, type: "spring" }}
              >
                УРОВЕНЬ {level.order}
              </motion.div>

              <h3>{level.title}</h3>
              <p>{level.description}</p>
              
              <div className="level-difficulty">
                <span>СЛОЖНОСТЬ:</span>
                <div className="difficulty-stars">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} style={{ opacity: j < level.difficulty ? 1 : 0.3 }}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={`/level/${level.id}/briefing`} className="btn-primary">
                  <span className="btn-icon">▶</span>
                  НАЧАТЬ МИССИЮ
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredLevels.length === 0 && (
        <motion.div 
          className="no-levels"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="no-levels-icon">🤖</div>
          {levels.length === 0 ? (
            <>
              <p>МИССИИ НЕ НАЙДЕНЫ</p>
              <p>Скоро здесь появятся захватывающие задачи!</p>
            </>
          ) : filter === 'completed' ? (
            <>
              <p>ПРОЙДЕННЫХ МИССИЙ ПОКА НЕТ</p>
              <p>Пройдите миссии во вкладке «Все уровни»</p>
            </>
          ) : (
            <>
              <p>ВСЕ МИССИИ ПРОЙДЕНЫ</p>
              <p>Отличная работа! Посмотрите «Пройденные»</p>
            </>
          )}
        </motion.div>
      )}
    </div>
  )
}
