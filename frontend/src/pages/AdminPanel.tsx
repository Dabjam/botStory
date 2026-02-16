import { useState } from 'react'
import { levelAPI } from '../services/api'
import './AdminPanel.css'

export default function AdminPanel() {
  const [levelData, setLevelData] = useState({
    title: '',
    description: '',
    narrative: '',
    order: 1,
    difficulty: 1,
    golden_code: '',
    golden_steps_count: 0,
    map_data: {
      width: 5,
      height: 5,
      cells: Array(5).fill(null).map(() => Array(5).fill('empty'))
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await levelAPI.create(levelData)
      alert('Уровень создан успешно!')
      // Reset form
      setLevelData({
        ...levelData,
        title: '',
        description: '',
        narrative: '',
        golden_code: ''
      })
    } catch (error: any) {
      alert('Ошибка: ' + (error.response?.data?.detail || 'Не удалось создать уровень'))
    }
  }

  const updateCell = (y: number, x: number, type: string) => {
    const newCells = [...levelData.map_data.cells]
    newCells[y][x] = type
    setLevelData({
      ...levelData,
      map_data: { ...levelData.map_data, cells: newCells }
    })
  }

  return (
    <div className="admin-panel">
      <h1>Конструктор уровней</h1>
      
      <form onSubmit={handleSubmit} className="level-form">
        <div className="form-section">
          <h2>Основная информация</h2>
          
          <div className="form-group">
            <label>Название</label>
            <input
              type="text"
              value={levelData.title}
              onChange={(e) => setLevelData({ ...levelData, title: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Описание</label>
            <textarea
              value={levelData.description}
              onChange={(e) => setLevelData({ ...levelData, description: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>Предыстория (нарратив)</label>
            <textarea
              value={levelData.narrative}
              onChange={(e) => setLevelData({ ...levelData, narrative: e.target.value })}
              rows={6}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Порядок</label>
              <input
                type="number"
                value={levelData.order}
                onChange={(e) => setLevelData({ ...levelData, order: parseInt(e.target.value) })}
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Сложность (1-5)</label>
              <input
                type="number"
                value={levelData.difficulty}
                onChange={(e) => setLevelData({ ...levelData, difficulty: parseInt(e.target.value) })}
                min="1"
                max="5"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Карта уровня</h2>
          <div className="map-editor">
            {levelData.map_data.cells.map((row, y) => (
              <div key={y} className="map-row">
                {row.map((cell, x) => (
                  <select
                    key={x}
                    value={cell}
                    onChange={(e) => updateCell(y, x, e.target.value)}
                    className={`map-cell ${cell}`}
                  >
                    <option value="empty">Пусто</option>
                    <option value="wall">Стена</option>
                    <option value="trap">Ловушка</option>
                    <option value="start">Старт</option>
                    <option value="finish">Финиш</option>
                  </select>
                ))}
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-section">
          <h2>Золотой эталон</h2>
          
          <div className="form-group">
            <label>Эталонный код</label>
            <textarea
              value={levelData.golden_code}
              onChange={(e) => setLevelData({ ...levelData, golden_code: e.target.value })}
              rows={8}
              placeholder="вперед&#10;налево&#10;вперед"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Количество шагов в эталоне</label>
            <input
              type="number"
              value={levelData.golden_steps_count}
              onChange={(e) => setLevelData({ ...levelData, golden_steps_count: parseInt(e.target.value) })}
              min="0"
              required
            />
          </div>
        </div>
        
        <button type="submit" className="submit-btn">
          Создать уровень
        </button>
      </form>
    </div>
  )
}
