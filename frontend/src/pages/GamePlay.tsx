import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { levelAPI, executeAPI } from '../services/api'
import IsometricCanvas from '../components/IsometricCanvas'
import CodeEditor from '../components/CodeEditor'
import Diary from '../components/Diary'
import LevelChat from '../components/LevelChat'
import Debriefing from '../components/Debriefing'
import './GamePlay.css'

interface Level {
  id: number
  title: string
  map_data: any
  golden_steps_count?: number
}

export default function GamePlay() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [level, setLevel] = useState<Level | null>(null)
  const [code, setCode] = useState('')
  const [robotHistory, setRobotHistory] = useState<any[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState<any>(null)
  const [showDebriefing, setShowDebriefing] = useState(false)
  const [sidebarTab, setSidebarTab] = useState<'diary' | 'chat'>('diary')

  useEffect(() => {
    if (id) {
      levelAPI.getById(parseInt(id))
        .then(res => setLevel(res.data))
        .catch(console.error)
    }
  }, [id])

  const handleExecute = async () => {
    if (!level || !code.trim()) return
    
    setIsExecuting(true)
    setExecutionResult(null)
    
    try {
      const response = await executeAPI.executeCode(level.id, code)
      const result = response.data
      
      setExecutionResult(result)
      setRobotHistory(result.history)
      
      if (result.success && result.reached_finish) {
        // Submit solution
        await levelAPI.submitSolution(level.id, {
          user_code: code,
          steps_count: result.steps_count
        })
        
        // Show debriefing after animation
        setTimeout(() => setShowDebriefing(true), 2000)
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Ошибка выполнения кода')
    } finally {
      setIsExecuting(false)
    }
  }

  const handleReset = () => {
    setRobotHistory([])
    setExecutionResult(null)
    setShowDebriefing(false)
  }

  if (!level) {
    return <div className="loading">Загрузка...</div>
  }

  if (showDebriefing) {
    return (
      <Debriefing
        levelId={level.id}
        result={executionResult}
        goldenSteps={level.golden_steps_count}
        onClose={() => navigate('/levels')}
        onRetry={() => setShowDebriefing(false)}
      />
    )
  }

  return (
    <div className="gameplay">
      <div className="gameplay-header">
        <h2>{level.title}</h2>
        <button onClick={() => navigate('/levels')} className="back-btn">
          ← Вернуться к уровням
        </button>
      </div>
      
      <div className="gameplay-layout">
        <div className="game-area">
          <IsometricCanvas
            mapData={level.map_data}
            robotHistory={robotHistory}
          />
          
          <CodeEditor
            value={code}
            onChange={setCode}
            onExecute={handleExecute}
            onReset={handleReset}
            isExecuting={isExecuting}
          />
        </div>
        
        <div className="sidebar">
          <div className="sidebar-tabs">
            <button 
              className={sidebarTab === 'diary' ? 'active' : ''}
              onClick={() => setSidebarTab('diary')}
            >
              📖 Дневник
            </button>
            <button 
              className={sidebarTab === 'chat' ? 'active' : ''}
              onClick={() => setSidebarTab('chat')}
            >
              💬 Чат
            </button>
          </div>
          
          <div className="sidebar-content">
            {sidebarTab === 'diary' && <Diary levelId={level.id} />}
            {sidebarTab === 'chat' && <LevelChat levelId={level.id} />}
          </div>
        </div>
      </div>
      
      {executionResult && !executionResult.success && (
        <div className="error-panel">
          <h3>Ошибка!</h3>
          <p>{executionResult.error}</p>
        </div>
      )}
    </div>
  )
}
