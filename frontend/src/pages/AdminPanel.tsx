import { useState } from 'react'
import { levelAPI } from '../services/api'
import './AdminPanel.css'

const CELL_TYPES = [
  { value: 'empty', label: 'Пусто', short: '·' },
  { value: 'wall', label: 'Стена', short: '▣' },
  { value: 'trap', label: 'Ловушка', short: '⚠' },
  { value: 'start', label: 'Старт', short: '▶' },
  { value: 'finish', label: 'Финиш', short: '★' }
] as const

export default function AdminPanel() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedCellType, setSelectedCellType] = useState<string>('empty')
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
    setMessage(null)
    try {
      await levelAPI.create(levelData)
      setMessage({ type: 'success', text: 'Уровень создан успешно!' })
      setLevelData({
        ...levelData,
        title: '',
        description: '',
        narrative: '',
        golden_code: ''
      })
    } catch (error: any) {
      const d = error.response?.data?.detail
      const text = Array.isArray(d) ? (d[0]?.msg || d[0] || d.join(', ')) : (d || 'Не удалось создать уровень')
      setMessage({ type: 'error', text: typeof text === 'string' ? text : 'Не удалось создать уровень' })
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
      {message && (
        <div className={`admin-message ${message.type}`}>
          {message.type === 'success' ? '✓' : '⚠'} {message.text}
        </div>
      )}
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
        
        <div className="form-section map-section">
          <h2>Карта уровня</h2>
          <div className="map-toolbar">
            <label className="map-toolbar-label">Тип клетки:</label>
            <div className="map-type-select-wrap">
              <select
                value={selectedCellType}
                onChange={(e) => setSelectedCellType(e.target.value)}
                className="map-type-select"
                aria-label="Выберите тип клетки"
              >
                {CELL_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <span className="map-type-select-icon" aria-hidden>▼</span>
            </div>
            <span className="map-toolbar-hint">Клик по клетке — установить тип</span>
          </div>
          <div className="map-editor">
            {levelData.map_data.cells.map((row, y) => (
              <div key={y} className="map-row">
                {row.map((cell, x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => updateCell(y, x, selectedCellType)}
                    className={`map-cell map-cell--${cell}`}
                    title={`${CELL_TYPES.find(t => t.value === cell)?.label ?? cell} — клик: ${CELL_TYPES.find(t => t.value === selectedCellType)?.label}`}
                  >
                    <span className="map-cell-icon">{CELL_TYPES.find(t => t.value === cell)?.short ?? '·'}</span>
                    <span className="map-cell-label">{CELL_TYPES.find(t => t.value === cell)?.label ?? cell}</span>
                  </button>
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
