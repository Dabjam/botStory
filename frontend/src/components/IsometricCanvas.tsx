import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import './IsometricCanvas.css'

interface Props {
  mapData: {
    width: number
    height: number
    cells: string[][]
  }
  robotHistory: Array<[number, number, number]>
}

const TILE_WIDTH = 80
const TILE_HEIGHT = 40
const TILE_DEPTH = 20

export default function IsometricCanvas({ mapData, robotHistory }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const currentStepRef = useRef<number>(0)
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size with margin
    const margin = 200
    canvas.width = (mapData.width + mapData.height) * TILE_WIDTH / 2 + margin * 2
    canvas.height = (mapData.width + mapData.height) * TILE_HEIGHT / 2 + margin * 2

    // Enhanced isometric tile with premium 3D depth
    const drawIsometricTile = (x: number, y: number, color: string, type: string) => {
      const isoX = (x - y) * (TILE_WIDTH / 2) * zoom + canvas.width / 2
      const isoY = (x + y) * (TILE_HEIGHT / 2) * zoom + margin
      const depth = type === 'wall' ? TILE_DEPTH * 3 : TILE_DEPTH

      // Enhanced shadow
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = '#000000'
      ctx.filter = 'blur(4px)'
      ctx.beginPath()
      ctx.moveTo(isoX, isoY + depth + 5)
      ctx.lineTo(isoX + TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom + depth + 5)
      ctx.lineTo(isoX, isoY + TILE_HEIGHT * zoom + depth + 5)
      ctx.lineTo(isoX - TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom + depth + 5)
      ctx.closePath()
      ctx.fill()
      ctx.filter = 'none'
      ctx.restore()

      // Top face with gradient
      ctx.save()
      const topGradient = ctx.createLinearGradient(
        isoX - TILE_WIDTH / 4 * zoom, isoY,
        isoX + TILE_WIDTH / 4 * zoom, isoY + TILE_HEIGHT * zoom
      )
      
      if (type === 'wall') {
        topGradient.addColorStop(0, '#1a1a2e')
        topGradient.addColorStop(0.5, '#0f0f1a')
        topGradient.addColorStop(1, '#0a0a10')
      } else if (type === 'start') {
        topGradient.addColorStop(0, '#00ff9f')
        topGradient.addColorStop(1, '#00aa66')
      } else if (type === 'finish') {
        topGradient.addColorStop(0, '#ffff00')
        topGradient.addColorStop(1, '#ffaa00')
      } else if (type === 'trap') {
        topGradient.addColorStop(0, '#ff0055')
        topGradient.addColorStop(1, '#aa0033')
      } else {
        topGradient.addColorStop(0, '#2a2a3e')
        topGradient.addColorStop(1, '#1a1a2e')
      }
      
      ctx.fillStyle = topGradient
      ctx.beginPath()
      ctx.moveTo(isoX, isoY)
      ctx.lineTo(isoX + TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom)
      ctx.lineTo(isoX, isoY + TILE_HEIGHT * zoom)
      ctx.lineTo(isoX - TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom)
      ctx.closePath()
      ctx.fill()

      // Add glow for special tiles
      if (type === 'start' || type === 'finish' || type === 'trap') {
        ctx.shadowBlur = 30
        ctx.shadowColor = color
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Stroke with neon effect
      ctx.strokeStyle = type === 'wall' ? '#00ffaa' : 'rgba(0, 255, 170, 0.4)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()

      // Left face (3D depth)
      ctx.save()
      const leftGradient = ctx.createLinearGradient(
        isoX - TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom,
        isoX - TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom + depth
      )
      leftGradient.addColorStop(0, type === 'wall' ? '#0a0a15' : '#15152a')
      leftGradient.addColorStop(1, type === 'wall' ? '#050508' : '#0a0a15')
      
      ctx.fillStyle = leftGradient
      ctx.beginPath()
      ctx.moveTo(isoX, isoY + TILE_HEIGHT * zoom)
      ctx.lineTo(isoX - TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom)
      ctx.lineTo(isoX - TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom + depth)
      ctx.lineTo(isoX, isoY + TILE_HEIGHT * zoom + depth)
      ctx.closePath()
      ctx.fill()
      
      if (type === 'wall') {
        ctx.strokeStyle = 'rgba(0, 255, 170, 0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
      ctx.restore()

      // Right face (3D depth)
      ctx.save()
      const rightGradient = ctx.createLinearGradient(
        isoX + TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom,
        isoX + TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom + depth
      )
      rightGradient.addColorStop(0, type === 'wall' ? '#08080d' : '#12122a')
      rightGradient.addColorStop(1, type === 'wall' ? '#030305' : '#08080d')
      
      ctx.fillStyle = rightGradient
      ctx.beginPath()
      ctx.moveTo(isoX, isoY + TILE_HEIGHT * zoom)
      ctx.lineTo(isoX + TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom)
      ctx.lineTo(isoX + TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom + depth)
      ctx.lineTo(isoX, isoY + TILE_HEIGHT * zoom + depth)
      ctx.closePath()
      ctx.fill()
      
      if (type === 'wall') {
        ctx.strokeStyle = 'rgba(0, 255, 170, 0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
      ctx.restore()

      // Add grid lines if enabled
      if (showGrid && type !== 'wall') {
        ctx.save()
        ctx.strokeStyle = 'rgba(0, 255, 159, 0.3)'
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(isoX, isoY)
        ctx.lineTo(isoX, isoY + TILE_HEIGHT * zoom)
        ctx.moveTo(isoX - TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom)
        ctx.lineTo(isoX + TILE_WIDTH / 2 * zoom, isoY + TILE_HEIGHT / 2 * zoom)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
      }

      // Add special markers with enhanced effects
      if (type === 'start') {
        drawEnhancedMarker(ctx, isoX, isoY, '▲', '#00ff9f', 35)
      } else if (type === 'finish') {
        drawEnhancedMarker(ctx, isoX, isoY, '★', '#ffff00', 40)
      } else if (type === 'trap') {
        drawEnhancedMarker(ctx, isoX, isoY, '⚠', '#ff0055', 32)
      }
    }

    const drawEnhancedMarker = (ctx: CanvasRenderingContext2D, x: number, y: number, symbol: string, color: string, size: number) => {
      ctx.save()
      
      // Pulsing background
      const pulseSize = Math.sin(Date.now() / 500) * 5 + size
      const pulseGradient = ctx.createRadialGradient(x, y + TILE_HEIGHT / 2 * zoom, 0, x, y + TILE_HEIGHT / 2 * zoom, pulseSize * zoom)
      pulseGradient.addColorStop(0, color + '80')
      pulseGradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = pulseGradient
      ctx.beginPath()
      ctx.arc(x, y + TILE_HEIGHT / 2 * zoom, pulseSize * zoom, 0, Math.PI * 2)
      ctx.fill()
      
      // Symbol with glow
      ctx.font = `bold ${size * zoom}px Arial`
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowBlur = 25
      ctx.shadowColor = color
      ctx.fillText(symbol, x, y + TILE_HEIGHT / 2 * zoom)
      
      // Outer glow ring
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.arc(x, y + TILE_HEIGHT / 2 * zoom, (size + 5) * zoom, 0, Math.PI * 2)
      ctx.stroke()
      
      ctx.restore()
    }


    // Enhanced robot with detailed 3D effect and glow
    const drawRobot = (x: number, y: number, direction: number, progress: number = 1) => {
      const isoX = (x - y) * (TILE_WIDTH / 2) * zoom + canvas.width / 2
      const isoY = (x + y) * (TILE_HEIGHT / 2) * zoom + margin - 40 * zoom

      ctx.save()

      // Enhanced shadow
      ctx.globalAlpha = 0.4
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      ctx.ellipse(isoX, isoY + 50 * zoom, 25 * zoom, 12 * zoom, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      // Outer glow aura
      const auraGradient = ctx.createRadialGradient(isoX, isoY, 0, isoX, isoY, 60 * zoom)
      auraGradient.addColorStop(0, 'rgba(0, 255, 170, 0.3)')
      auraGradient.addColorStop(0.5, 'rgba(0, 217, 255, 0.15)')
      auraGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = auraGradient
      ctx.beginPath()
      ctx.arc(isoX, isoY, 60 * zoom, 0, Math.PI * 2)
      ctx.fill()

      // Legs (bottom)
      ctx.save()
      const legGradient = ctx.createLinearGradient(isoX, isoY + 15 * zoom, isoX, isoY + 35 * zoom)
      legGradient.addColorStop(0, '#00d9ff')
      legGradient.addColorStop(1, '#0088ff')
      
      ctx.fillStyle = legGradient
      ctx.shadowBlur = 15
      ctx.shadowColor = '#00d9ff'
      
      // Left leg
      ctx.fillRect(isoX - 12 * zoom, isoY + 15 * zoom, 8 * zoom, 20 * zoom)
      // Right leg
      ctx.fillRect(isoX + 4 * zoom, isoY + 15 * zoom, 8 * zoom, 20 * zoom)
      
      // Feet glow
      ctx.fillStyle = '#00ff9f'
      ctx.shadowBlur = 20
      ctx.shadowColor = '#00ff9f'
      ctx.fillRect(isoX - 14 * zoom, isoY + 35 * zoom, 10 * zoom, 4 * zoom)
      ctx.fillRect(isoX + 4 * zoom, isoY + 35 * zoom, 10 * zoom, 4 * zoom)
      ctx.restore()

      // Main body (torso) with metallic effect
      const bodyGradient = ctx.createLinearGradient(isoX - 20 * zoom, isoY - 10 * zoom, isoX + 20 * zoom, isoY + 20 * zoom)
      bodyGradient.addColorStop(0, '#00ffaa')
      bodyGradient.addColorStop(0.3, '#00ff9f')
      bodyGradient.addColorStop(0.6, '#00d9ff')
      bodyGradient.addColorStop(1, '#00aabb')
      
      ctx.fillStyle = bodyGradient
      ctx.shadowBlur = 30
      ctx.shadowColor = '#00ffaa'
      
      ctx.fillRect(isoX - 18 * zoom, isoY - 10 * zoom, 36 * zoom, 28 * zoom)
      
      // Chest core (energy reactor)
      const coreGradient = ctx.createRadialGradient(isoX, isoY + 3 * zoom, 0, isoX, isoY + 3 * zoom, 10 * zoom)
      coreGradient.addColorStop(0, '#ff00ff')
      coreGradient.addColorStop(0.5, '#ff0088')
      coreGradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = coreGradient
      ctx.shadowBlur = 25
      ctx.shadowColor = '#ff00ff'
      ctx.beginPath()
      ctx.arc(isoX, isoY + 3 * zoom, 8 * zoom, 0, Math.PI * 2)
      ctx.fill()
      
      // Core pulse animation
      const pulseSize = Math.sin(Date.now() / 300) * 2 + 8
      ctx.fillStyle = '#ffffff'
      ctx.shadowBlur = 30
      ctx.beginPath()
      ctx.arc(isoX, isoY + 3 * zoom, pulseSize * zoom * 0.5, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.shadowBlur = 0

      // Arms
      ctx.fillStyle = '#00d9ff'
      ctx.shadowBlur = 15
      ctx.shadowColor = '#00d9ff'
      // Left arm
      ctx.fillRect(isoX - 26 * zoom, isoY - 5 * zoom, 6 * zoom, 18 * zoom)
      // Right arm
      ctx.fillRect(isoX + 20 * zoom, isoY - 5 * zoom, 6 * zoom, 18 * zoom)
      ctx.shadowBlur = 0

      // Head with helmet effect
      const headGradient = ctx.createRadialGradient(
        isoX, isoY - 25 * zoom, 0,
        isoX, isoY - 25 * zoom, 18 * zoom
      )
      headGradient.addColorStop(0, '#00ffff')
      headGradient.addColorStop(0.6, '#00d9ff')
      headGradient.addColorStop(1, '#0088ff')
      
      ctx.fillStyle = headGradient
      ctx.shadowBlur = 25
      ctx.shadowColor = '#00d9ff'
      ctx.beginPath()
      ctx.arc(isoX, isoY - 25 * zoom, 18 * zoom, 0, Math.PI * 2)
      ctx.fill()
      
      // Visor line
      ctx.strokeStyle = '#00ff9f'
      ctx.lineWidth = 2
      ctx.shadowBlur = 15
      ctx.shadowColor = '#00ff9f'
      ctx.beginPath()
      ctx.moveTo(isoX - 15 * zoom, isoY - 25 * zoom)
      ctx.lineTo(isoX + 15 * zoom, isoY - 25 * zoom)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Eyes with intense glow
      const eyeGlow = Math.sin(Date.now() / 200) * 0.3 + 0.7
      ctx.fillStyle = `rgba(255, 0, 255, ${eyeGlow})`
      ctx.shadowBlur = 20
      ctx.shadowColor = '#ff00ff'
      
      // Left eye
      ctx.beginPath()
      ctx.arc(isoX - 7 * zoom, isoY - 27 * zoom, 4 * zoom, 0, Math.PI * 2)
      ctx.fill()
      
      // Right eye
      ctx.beginPath()
      ctx.arc(isoX + 7 * zoom, isoY - 27 * zoom, 4 * zoom, 0, Math.PI * 2)
      ctx.fill()
      
      // Eye pupils (white dots)
      ctx.fillStyle = '#ffffff'
      ctx.shadowBlur = 10
      ctx.shadowColor = '#ffffff'
      ctx.beginPath()
      ctx.arc(isoX - 7 * zoom, isoY - 27 * zoom, 2 * zoom, 0, Math.PI * 2)
      ctx.arc(isoX + 7 * zoom, isoY - 27 * zoom, 2 * zoom, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.shadowBlur = 0

      // Antenna
      ctx.strokeStyle = '#ffff00'
      ctx.lineWidth = 3 * zoom
      ctx.shadowBlur = 20
      ctx.shadowColor = '#ffff00'
      ctx.beginPath()
      ctx.moveTo(isoX, isoY - 43 * zoom)
      ctx.lineTo(isoX, isoY - 50 * zoom)
      ctx.stroke()
      
      // Antenna tip
      ctx.fillStyle = '#ffff00'
      ctx.shadowBlur = 25
      ctx.beginPath()
      ctx.arc(isoX, isoY - 52 * zoom, 4 * zoom, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Direction indicator arrow
      ctx.save()
      ctx.translate(isoX, isoY - 55 * zoom)
      ctx.rotate((direction * 90) * Math.PI / 180)
      
      const arrowGradient = ctx.createLinearGradient(0, -15 * zoom, 0, -5 * zoom)
      arrowGradient.addColorStop(0, '#ffff00')
      arrowGradient.addColorStop(1, '#ff8800')
      
      ctx.fillStyle = arrowGradient
      ctx.shadowBlur = 20
      ctx.shadowColor = '#ffff00'
      ctx.beginPath()
      ctx.moveTo(0, -15 * zoom)
      ctx.lineTo(10 * zoom, -5 * zoom)
      ctx.lineTo(-10 * zoom, -5 * zoom)
      ctx.closePath()
      ctx.fill()
      ctx.restore()

      // Energy rings (animated)
      for (let i = 0; i < 3; i++) {
        const ringProgress = (Date.now() / 1500 + i * 0.33) % 1
        const ringRadius = 35 * zoom + ringProgress * 25
        const ringAlpha = (1 - ringProgress) * 0.8
        
        ctx.strokeStyle = `rgba(0, 255, 159, ${ringAlpha})`
        ctx.lineWidth = 3 * (1 - ringProgress * 0.5)
        ctx.shadowBlur = 15
        ctx.shadowColor = 'rgba(0, 255, 159, 0.8)'
        ctx.beginPath()
        ctx.arc(isoX, isoY, ringRadius, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      // Outer hexagon shield
      const shieldProgress = (Date.now() / 2000) % 1
      const shieldRadius = 45 * zoom
      ctx.strokeStyle = `rgba(0, 217, 255, ${0.5 + Math.sin(shieldProgress * Math.PI * 2) * 0.3})`
      ctx.lineWidth = 2
      ctx.shadowBlur = 20
      ctx.shadowColor = '#00d9ff'
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + shieldProgress * Math.PI * 2
        const px = isoX + Math.cos(angle) * shieldRadius
        const py = isoY + Math.sin(angle) * shieldRadius * 0.6
        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }
      ctx.closePath()
      ctx.stroke()

      ctx.restore()
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw map
      for (let y = 0; y < mapData.height; y++) {
        for (let x = 0; x < mapData.width; x++) {
          const cellType = mapData.cells[y][x]
          
          let color = '#1a1a2e'
          if (cellType === 'wall') color = '#0f0f1a'
          else if (cellType === 'trap') color = '#2a0a0a'
          else if (cellType === 'start') color = '#0a2a0a'
          else if (cellType === 'finish') color = '#2a2a0a'
          
          drawIsometricTile(x, y, color, cellType)
        }
      }

      // Draw robot
      if (robotHistory.length > 0) {
        const step = Math.min(Math.floor(currentStepRef.current), robotHistory.length - 1)
        const [rx, ry, dir] = robotHistory[step]
        
        // Calculate smooth progress between steps
        const progress = currentStepRef.current - step
        
        drawRobot(rx, ry, dir, progress)
      }
    }

    // Animation loop
    const animate = () => {
      if (currentStepRef.current < robotHistory.length - 1) {
        currentStepRef.current += 0.2 // Slower animation for smoothness
        render()
        animationRef.current = requestAnimationFrame(animate)
      } else {
        render()
      }
    }

    if (robotHistory.length > 0) {
      currentStepRef.current = 0
      animate()
    } else {
      render()
    }

    // Continuous animation for effects
    const continuousAnimate = () => {
      render()
      requestAnimationFrame(continuousAnimate)
    }
    continuousAnimate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [mapData, robotHistory, zoom, showGrid])

  return (
    <div className="isometric-canvas-wrapper">
      <div className="canvas-controls">
        <motion.button
          className="control-btn"
          onClick={() => setShowGrid(!showGrid)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="control-icon">⊞</span>
          {showGrid ? 'Скрыть сетку' : 'Показать сетку'}
        </motion.button>
        
        <div className="zoom-controls">
          <motion.button
            className="control-btn"
            onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="control-icon">+</span>
          </motion.button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <motion.button
            className="control-btn"
            onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="control-icon">−</span>
          </motion.button>
        </div>
      </div>

      <div className="isometric-canvas-container">
        <canvas ref={canvasRef} className="isometric-canvas" />
        
        {/* Holographic overlay effect */}
        <div className="holo-overlay" />
        
        {/* Scan lines */}
        <div className="scan-lines" />
      </div>

      {/* Status indicators */}
      <div className="status-bar">
        <div className="status-item">
          <span className="status-label">СИСТЕМА:</span>
          <span className="status-value glow-text">АКТИВНА</span>
        </div>
        <div className="status-item">
          <span className="status-label">РАЗМЕР КАРТЫ:</span>
          <span className="status-value">{mapData.width}×{mapData.height}</span>
        </div>
        <div className="status-item">
          <span className="status-label">ПОЗИЦИЯ:</span>
          <span className="status-value">
            {robotHistory.length > 0 
              ? `[${robotHistory[Math.floor(currentStepRef.current)][0]}, ${robotHistory[Math.floor(currentStepRef.current)][1]}]`
              : '[0, 0]'
            }
          </span>
        </div>
      </div>
    </div>
  )
}
