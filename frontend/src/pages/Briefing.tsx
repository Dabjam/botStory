import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { levelAPI, highlightsAPI } from '../services/api'
import './Briefing.css'

interface Level {
  id: number
  title: string
  narrative: string
}

export default function Briefing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [level, setLevel] = useState<Level | null>(null)
  const [highlights, setHighlights] = useState<any[]>([])
  const [selectedColor, setSelectedColor] = useState('yellow')

  useEffect(() => {
    if (id) {
      levelAPI.getById(parseInt(id))
        .then(res => setLevel(res.data))
        .catch(console.error)
      
      highlightsAPI.getForLevel(parseInt(id))
        .then(res => setHighlights(res.data))
        .catch(console.error)
    }
  }, [id])

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.toString().length === 0) return
    
    const range = selection.getRangeAt(0)
    const selectedText = selection.toString()
    
    // In a real app, calculate char_start and char_end properly
    const char_start = 0
    const char_end = selectedText.length
    
    highlightsAPI.create({
      level_id: parseInt(id!),
      text_fragment: selectedText,
      color: selectedColor,
      char_start,
      char_end
    }).then(() => {
      // Refresh highlights
      highlightsAPI.getForLevel(parseInt(id!))
        .then(res => setHighlights(res.data))
    }).catch(console.error)
  }

  if (!level) {
    return <div className="loading">Загрузка...</div>
  }

  return (
    <div className="briefing">
      <div className="briefing-container">
        <h1>{level.title}</h1>
        
        <div className="highlight-toolbar">
          <span>Маркер:</span>
          <button 
            className={`marker-btn red ${selectedColor === 'red' ? 'active' : ''}`}
            onClick={() => setSelectedColor('red')}
          >
            Важно
          </button>
          <button 
            className={`marker-btn yellow ${selectedColor === 'yellow' ? 'active' : ''}`}
            onClick={() => setSelectedColor('yellow')}
          >
            Правило
          </button>
          <button 
            className={`marker-btn green ${selectedColor === 'green' ? 'active' : ''}`}
            onClick={() => setSelectedColor('green')}
          >
            Ключ
          </button>
          <button onClick={handleTextSelection} className="save-highlight-btn">
            Сохранить выделение
          </button>
        </div>
        
        <div className="narrative" onMouseUp={handleTextSelection}>
          {level.narrative.split('\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        
        <button 
          className="start-mission-btn"
          onClick={() => navigate(`/level/${id}/play`)}
        >
          Начать миссию →
        </button>
      </div>
    </div>
  )
}
