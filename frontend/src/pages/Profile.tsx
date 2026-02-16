import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { levelAPI } from '../services/api'
import './Profile.css'

export default function Profile() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ completed: 0, total: 0 })

  useEffect(() => {
    // In real app, fetch user's completed levels
    levelAPI.getAll().then(res => {
      setStats({
        completed: 0, // Would need backend endpoint for this
        total: res.data.length
      })
    }).catch(console.error)
  }, [])

  if (!user) return null

  return (
    <div className="profile">
      <div className="profile-card">
        <div className="profile-avatar">
          {user.username.charAt(0).toUpperCase()}
        </div>
        
        <h1>{user.username}</h1>
        <p className="profile-email">{user.email}</p>
        <div className="profile-role">
          Роль: <span>{user.role === 'admin' ? 'Администратор' : 'Игрок'}</span>
        </div>
        
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Пройдено уровней</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Всего уровней</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <div className="stat-label">Прогресс</div>
          </div>
        </div>
        
        <div className="profile-info">
          <p>Аккаунт создан: {new Date(user.created_at).toLocaleDateString('ru-RU')}</p>
        </div>
      </div>
    </div>
  )
}
