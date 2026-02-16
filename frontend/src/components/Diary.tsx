import { useEffect, useState } from 'react'
import { notesAPI, highlightsAPI } from '../services/api'
import './Diary.css'

interface Props {
  levelId: number
}

export default function Diary({ levelId }: Props) {
  const [notes, setNotes] = useState<any[]>([])
  const [highlights, setHighlights] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [activeTab, setActiveTab] = useState<'highlights' | 'notes'>('highlights')

  useEffect(() => {
    loadData()
  }, [levelId])

  const loadData = () => {
    notesAPI.getAll(levelId)
      .then(res => setNotes(res.data))
      .catch(console.error)
    
    highlightsAPI.getForLevel(levelId)
      .then(res => setHighlights(res.data))
      .catch(console.error)
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return
    
    notesAPI.create({
      level_id: levelId,
      content: newNote,
      type: 'custom'
    }).then(() => {
      setNewNote('')
      loadData()
    }).catch(console.error)
  }

  return (
    <div className="diary">
      <h3>Дневник исследователя</h3>
      
      <div className="diary-tabs">
        <button 
          className={activeTab === 'highlights' ? 'active' : ''}
          onClick={() => setActiveTab('highlights')}
        >
          Выделения ({highlights.length})
        </button>
        <button 
          className={activeTab === 'notes' ? 'active' : ''}
          onClick={() => setActiveTab('notes')}
        >
          Заметки ({notes.length})
        </button>
      </div>
      
      <div className="diary-content">
        {activeTab === 'highlights' && (
          <div className="highlights-list">
            {highlights.length === 0 && (
              <p className="empty-message">
                Пока нет выделений. Выделите важный текст в брифинге!
              </p>
            )}
            {highlights.map(h => (
              <div key={h.id} className={`highlight-item ${h.color}`}>
                <div className="highlight-text">"{h.text_fragment}"</div>
                <div className="highlight-meta">{h.color}</div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'notes' && (
          <div className="notes-list">
            <div className="note-input">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Добавить заметку..."
                rows={3}
              />
              <button onClick={handleAddNote} className="add-note-btn">
                Добавить
              </button>
            </div>
            
            {notes.map(note => (
              <div key={note.id} className="note-item">
                <div className="note-content">{note.content}</div>
                <div className="note-date">
                  {new Date(note.created_at).toLocaleDateString('ru-RU')}
                </div>
              </div>
            ))}
            
            {notes.length === 0 && (
              <p className="empty-message">Пока нет заметок</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
