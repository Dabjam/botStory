import { useEffect, useRef, useState, useMemo } from 'react'
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
const TILE_DEPTH = 16
const WALL_HEIGHT = 58

export default function IsometricCanvas({ mapData, robotHistory }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const currentStepRef = useRef<number>(0)
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const startCell = useMemo(() => {
    if (!mapData?.cells) return null
    for (let yy = 0; yy < mapData.height; yy++) {
      for (let xx = 0; xx < mapData.width; xx++) {
        if (mapData.cells[yy][xx] === 'start') return { x: xx, y: yy }
      }
    }
    return null
  }, [mapData])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size with margin
    const margin = 200
    canvas.width = (mapData.width + mapData.height) * TILE_WIDTH / 2 + margin * 2
    canvas.height = (mapData.width + mapData.height) * TILE_HEIGHT / 2 + margin * 2

    const getTilePoints = (isoX: number, isoY: number) => {
      const top = { x: isoX, y: isoY }
      const right = { x: isoX + (TILE_WIDTH / 2) * zoom, y: isoY + (TILE_HEIGHT / 2) * zoom }
      const bottom = { x: isoX, y: isoY + TILE_HEIGHT * zoom }
      const left = { x: isoX - (TILE_WIDTH / 2) * zoom, y: isoY + (TILE_HEIGHT / 2) * zoom }
      const center = { x: isoX, y: isoY + (TILE_HEIGHT / 2) * zoom }
      return { top, right, bottom, left, center }
    }

    const drawInsetDiamond = (
      ctx: CanvasRenderingContext2D,
      isoX: number,
      isoY: number,
      inset: number,
      fill: CanvasFillStrokeStyles['fillStyle'],
      stroke: CanvasFillStrokeStyles['strokeStyle'],
      lineWidth: number
    ) => {
      const { center } = getTilePoints(isoX, isoY)
      const rx = (TILE_WIDTH / 2) * zoom * inset
      const ry = (TILE_HEIGHT / 2) * zoom * inset
      ctx.save()
      ctx.fillStyle = fill
      ctx.strokeStyle = stroke
      ctx.lineWidth = lineWidth
      ctx.beginPath()
      ctx.moveTo(center.x, center.y - ry)
      ctx.lineTo(center.x + rx, center.y)
      ctx.lineTo(center.x, center.y + ry)
      ctx.lineTo(center.x - rx, center.y)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }

    const drawChargingStation = (
      ctx: CanvasRenderingContext2D,
      isoX: number,
      isoY: number,
      variant: 'start' | 'finish'
    ) => {
      const { center } = getTilePoints(isoX, isoY)
      const baseColor = variant === 'finish' ? '#fbbf24' : '#b794f6'
      const glowColor = variant === 'finish' ? 'rgba(251, 191, 36, 0.55)' : 'rgba(183, 148, 246, 0.55)'
      const pulse = (Math.sin(Date.now() / 350) + 1) / 2

      // Base pad (dark metal + neon rim)
      const padGradient = ctx.createLinearGradient(center.x - 30 * zoom, center.y - 18 * zoom, center.x + 30 * zoom, center.y + 18 * zoom)
      padGradient.addColorStop(0, 'rgba(10, 10, 18, 0.95)')
      padGradient.addColorStop(1, 'rgba(20, 16, 35, 0.95)')
      drawInsetDiamond(ctx, isoX, isoY, 0.72, padGradient, `rgba(255,255,255,0.08)`, 1)

      ctx.save()
      ctx.shadowBlur = 18
      ctx.shadowColor = glowColor
      drawInsetDiamond(ctx, isoX, isoY, 0.82, 'rgba(0,0,0,0)', baseColor, 2)
      ctx.restore()

      // Concentric rings (charging field)
      ctx.save()
      ctx.translate(center.x, center.y)
      ctx.strokeStyle = `rgba(255,255,255,${0.12 + pulse * 0.18})`
      ctx.lineWidth = 1.5
      for (let i = 0; i < 3; i++) {
        const r = (10 + i * 7) * zoom * (0.9 + pulse * 0.15)
        ctx.beginPath()
        ctx.ellipse(0, 0, r * 1.6, r * 0.9, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()

      // Charging icon (⚡) + small LEDs
      ctx.save()
      ctx.font = `bold ${18 * zoom}px Arial`
      ctx.fillStyle = baseColor
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowBlur = 22
      ctx.shadowColor = glowColor
      ctx.fillText('⚡', center.x, center.y)
      ctx.shadowBlur = 0

      // LEDs
      const ledA = variant === 'finish' ? '#22c55e' : '#60a5fa'
      const ledB = variant === 'finish' ? '#60a5fa' : '#22c55e'
      const dx = 22 * zoom
      ctx.fillStyle = ledA
      ctx.beginPath()
      ctx.arc(center.x - dx, center.y + 6 * zoom, 3.2 * zoom, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = ledB
      ctx.beginPath()
      ctx.arc(center.x + dx, center.y - 6 * zoom, 3.2 * zoom, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const drawLabWallDetails = (ctx: CanvasRenderingContext2D, isoX: number, isoY: number, depth: number) => {
      const { top, right, bottom, left, center } = getTilePoints(isoX, isoY)

      ctx.save()
      // Panel inset on top face
      drawInsetDiamond(ctx, isoX, isoY, 0.86, 'rgba(0,0,0,0.12)', 'rgba(255,255,255,0.08)', 1)

      // Glowing seams (like lab panels)
      ctx.strokeStyle = 'rgba(183, 148, 246, 0.35)'
      ctx.lineWidth = 1
      ctx.shadowBlur = 10
      ctx.shadowColor = 'rgba(183, 148, 246, 0.35)'
      ctx.beginPath()
      ctx.moveTo(top.x, top.y)
      ctx.lineTo(bottom.x, bottom.y)
      ctx.moveTo(left.x, left.y)
      ctx.lineTo(right.x, right.y)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Rivets (corners of inset)
      const rivet = (px: number, py: number) => {
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.beginPath()
        ctx.arc(px, py, 2.2 * zoom, 0, Math.PI * 2)
        ctx.fill()
      }
      const inset = 0.86
      const rx = (TILE_WIDTH / 2) * zoom * inset
      const ry = (TILE_HEIGHT / 2) * zoom * inset
      rivet(center.x, center.y - ry)
      rivet(center.x + rx, center.y)
      rivet(center.x, center.y + ry)
      rivet(center.x - rx, center.y)

      // Hazard stripe on the front edge (bottom -> right and bottom -> left)
      const stripe = (ax: number, ay: number, bx: number, by: number) => {
        const stripes = 8
        for (let i = 0; i < stripes; i++) {
          const t0 = i / stripes
          const t1 = (i + 1) / stripes
          const x0 = ax + (bx - ax) * t0
          const y0 = ay + (by - ay) * t0
          const x1 = ax + (bx - ax) * t1
          const y1 = ay + (by - ay) * t1
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(251, 191, 36, 0.55)' : 'rgba(0, 0, 0, 0.45)'
          ctx.lineWidth = 3 * zoom
          ctx.beginPath()
          ctx.moveTo(x0, y0)
          ctx.lineTo(x1, y1)
          ctx.stroke()
        }
      }
      stripe(bottom.x, bottom.y, right.x, right.y)
      stripe(bottom.x, bottom.y, left.x, left.y)

      // Side seam glow (vertical edges)
      ctx.strokeStyle = 'rgba(183, 148, 246, 0.22)'
      ctx.lineWidth = 2
      ctx.shadowBlur = 14
      ctx.shadowColor = 'rgba(183, 148, 246, 0.25)'
      // Left vertical edge
      ctx.beginPath()
      ctx.moveTo(left.x, left.y)
      ctx.lineTo(left.x, left.y + depth)
      ctx.stroke()
      // Right vertical edge
      ctx.beginPath()
      ctx.moveTo(right.x, right.y)
      ctx.lineTo(right.x, right.y + depth)
      ctx.stroke()
      ctx.restore()
    }

    // Draw lab details on the vertical front face of a tall wall block
    const drawLabWallDetailsOnFront = (
      ctx: CanvasRenderingContext2D,
      isoX: number,
      baseY: number,
      wallHeight: number
    ) => {
      const w = (TILE_WIDTH / 2) * zoom
      const left = isoX - w
      const right = isoX + w
      const top = baseY - wallHeight

      ctx.save()
      // Vertical panel seams (glow)
      ctx.strokeStyle = 'rgba(183, 148, 246, 0.4)'
      ctx.lineWidth = 1.5
      ctx.shadowBlur = 8
      ctx.shadowColor = 'rgba(183, 148, 246, 0.35)'
      ctx.beginPath()
      ctx.moveTo(isoX - w * 0.4, baseY)
      ctx.lineTo(isoX - w * 0.4, top)
      ctx.moveTo(isoX + w * 0.4, baseY)
      ctx.lineTo(isoX + w * 0.4, top)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Rivets at corners of front face
      ;[
        [left, baseY], [right, baseY], [left, top], [right, top],
        [isoX - w * 0.4, baseY - wallHeight * 0.5], [isoX + w * 0.4, baseY - wallHeight * 0.5]
      ].forEach(([px, py]) => {
        ctx.fillStyle = 'rgba(255,255,255,0.28)'
        ctx.beginPath()
        ctx.arc(px, py, 2.2 * zoom, 0, Math.PI * 2)
        ctx.fill()
      })

      // Hazard stripes along bottom and top of front face
      const stripeHorz = (y: number) => {
        const stripes = 10
        for (let i = 0; i < stripes; i++) {
          const t0 = i / stripes
          const t1 = (i + 1) / stripes
          const x0 = left + (right - left) * t0
          const x1 = left + (right - left) * t1
          ctx.strokeStyle = i % 2 === 0 ? 'rgba(251, 191, 36, 0.6)' : 'rgba(0, 0, 0, 0.5)'
          ctx.lineWidth = 3 * zoom
          ctx.beginPath()
          ctx.moveTo(x0, y)
          ctx.lineTo(x1, y)
          ctx.stroke()
        }
      }
      stripeHorz(baseY - 2)
      stripeHorz(top + 2)
      ctx.restore()
    }

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

      // ——— Volumetric wall: full 3D block (base, front, left, right, top + lab details) ———
      if (type === 'wall') {
        const wh = WALL_HEIGHT * zoom
        const baseY = isoY + (TILE_HEIGHT / 2) * zoom
        const w = (TILE_WIDTH / 2) * zoom
        const h = (TILE_HEIGHT / 2) * zoom

        // 1) Base (dark floor under wall)
        ctx.save()
        ctx.fillStyle = '#0a0a12'
        ctx.beginPath()
        ctx.moveTo(isoX, isoY)
        ctx.lineTo(isoX + w, baseY)
        ctx.lineTo(isoX, isoY + TILE_HEIGHT * zoom)
        ctx.lineTo(isoX - w, baseY)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = 'rgba(183,148,246,0.15)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()

        // 2) Front face (vertical rectangle)
        ctx.save()
        const frontGrad = ctx.createLinearGradient(isoX - w, baseY, isoX - w, baseY - wh)
        frontGrad.addColorStop(0, '#1a1a2e')
        frontGrad.addColorStop(0.4, '#12121f')
        frontGrad.addColorStop(1, '#0a0a14')
        ctx.fillStyle = frontGrad
        ctx.beginPath()
        ctx.moveTo(isoX - w, baseY)
        ctx.lineTo(isoX + w, baseY)
        ctx.lineTo(isoX + w, baseY - wh)
        ctx.lineTo(isoX - w, baseY - wh)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = 'rgba(183,148,246,0.25)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()

        // 3) Left face (vertical parallelogram, receding to back)
        ctx.save()
        const leftGrad = ctx.createLinearGradient(isoX - w, baseY, isoX, isoY)
        leftGrad.addColorStop(0, '#0f0f18')
        leftGrad.addColorStop(1, '#06060c')
        ctx.fillStyle = leftGrad
        ctx.beginPath()
        ctx.moveTo(isoX - w, baseY)
        ctx.lineTo(isoX - w, baseY - wh)
        ctx.lineTo(isoX, isoY - wh)
        ctx.lineTo(isoX, isoY)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = 'rgba(183,148,246,0.12)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()

        // 4) Right face
        ctx.save()
        const rightGrad = ctx.createLinearGradient(isoX + w, baseY, isoX, isoY)
        rightGrad.addColorStop(0, '#0c0c14')
        rightGrad.addColorStop(1, '#050508')
        ctx.fillStyle = rightGrad
        ctx.beginPath()
        ctx.moveTo(isoX + w, baseY)
        ctx.lineTo(isoX + w, baseY - wh)
        ctx.lineTo(isoX, isoY - wh)
        ctx.lineTo(isoX, isoY)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = 'rgba(183,148,246,0.12)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()

        // 5) Top face of wall (diamond)
        ctx.save()
        const topCenterY = baseY - wh
        const topGradWall = ctx.createLinearGradient(isoX - w / 2, topCenterY - h, isoX + w / 2, topCenterY + h)
        topGradWall.addColorStop(0, '#252538')
        topGradWall.addColorStop(0.5, '#16162a')
        topGradWall.addColorStop(1, '#0d0d18')
        ctx.fillStyle = topGradWall
        ctx.beginPath()
        ctx.moveTo(isoX, topCenterY - h)
        ctx.lineTo(isoX + w, topCenterY)
        ctx.lineTo(isoX, topCenterY + h)
        ctx.lineTo(isoX - w, topCenterY)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = 'rgba(183,148,246,0.35)'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.restore()

        drawLabWallDetailsOnFront(ctx, isoX, baseY, wh)
        return
      }

      // Top face with gradient (non-wall)
      ctx.save()
      const topGradient = ctx.createLinearGradient(
        isoX - TILE_WIDTH / 4 * zoom, isoY,
        isoX + TILE_WIDTH / 4 * zoom, isoY + TILE_HEIGHT * zoom
      )
      
      if (type === 'start') {
        topGradient.addColorStop(0, '#b794f6')
        topGradient.addColorStop(1, '#7c3aed')
      } else if (type === 'finish') {
        topGradient.addColorStop(0, '#fbbf24')
        topGradient.addColorStop(1, '#f59e0b')
      } else if (type === 'trap') {
        topGradient.addColorStop(0, '#f87171')
        topGradient.addColorStop(1, '#dc2626')
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
      ctx.strokeStyle = type === 'wall' ? '#b794f6' : 'rgba(183, 148, 246, 0.4)'
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
        ctx.strokeStyle = 'rgba(183, 148, 246, 0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
      ctx.restore()

      // Add grid lines if enabled
      if (showGrid && type !== 'wall') {
        ctx.save()
        ctx.strokeStyle = 'rgba(183, 148, 246, 0.3)'
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

      // Lab wall / charging station overlays (readability + theme)
      if (type === 'wall') {
        drawLabWallDetails(ctx, isoX, isoY, depth)
      } else if (type === 'start') {
        drawChargingStation(ctx, isoX, isoY, 'start')
      } else if (type === 'finish') {
        drawChargingStation(ctx, isoX, isoY, 'finish')
      } else if (type === 'trap') {
        drawEnhancedMarker(ctx, isoX, isoY, '⚠', '#f87171', 32)
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


    // Direction names for isometric: 0=North(up), 1=East(right), 2=South(down), 3=West(left)
    const getDirectionAngle = (d: number) => (d * 90) * Math.PI / 180

    // Draw robot tile highlight and direction cone on the floor (so position and facing are obvious)
    const drawRobotTileHighlight = (x: number, y: number, direction: number) => {
      const isoX = (x - y) * (TILE_WIDTH / 2) * zoom + canvas.width / 2
      const isoY = (x + y) * (TILE_HEIGHT / 2) * zoom + margin
      const centerY = isoY + TILE_HEIGHT / 2 * zoom

      ctx.save()

      // 1) Bright pill-shaped outline on the tile (robot is here)
      ctx.strokeStyle = 'rgba(183, 148, 246, 0.95)'
      ctx.lineWidth = 3
      ctx.shadowBlur = 25
      ctx.shadowColor = '#b794f6'
      ctx.beginPath()
      ctx.ellipse(isoX, centerY, (TILE_WIDTH / 2) * zoom * 0.85, (TILE_HEIGHT / 2) * zoom * 0.9, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0

      // 2) Direction cone (wedge) on the tile — shows which way the robot faces
      const angle = getDirectionAngle(direction)
      const wedgeRadius = (TILE_WIDTH / 2) * zoom * 1.1
      const wedgeStart = -Math.PI / 4
      const wedgeEnd = Math.PI / 4
      ctx.beginPath()
      ctx.moveTo(isoX, centerY)
      ctx.arc(isoX, centerY, wedgeRadius, angle + wedgeStart, angle + wedgeEnd)
      ctx.closePath()
      ctx.fillStyle = 'rgba(251, 191, 36, 0.35)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)'
      ctx.lineWidth = 2
      ctx.shadowBlur = 12
      ctx.shadowColor = '#fbbf24'
      ctx.stroke()
      ctx.shadowBlur = 0

      // 3) Small "forward" tick at the tip of the cone
      const tipX = isoX + Math.sin(angle) * wedgeRadius * 0.9
      const tipY = centerY - Math.cos(angle) * wedgeRadius * 0.9
      ctx.fillStyle = '#fbbf24'
      ctx.shadowBlur = 10
      ctx.shadowColor = '#fbbf24'
      ctx.beginPath()
      ctx.arc(tipX, tipY, 4 * zoom, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.restore()
    }

    // Enhanced robot with detailed 3D effect and glow
    const drawRobot = (x: number, y: number, direction: number, progress: number = 1) => {
      const isoX = (x - y) * (TILE_WIDTH / 2) * zoom + canvas.width / 2
      const isoY = (x + y) * (TILE_HEIGHT / 2) * zoom + margin - 40 * zoom

      ctx.save()

      // Draw tile highlight and direction cone first (under the robot)
      drawRobotTileHighlight(x, y, direction)

      // Enhanced shadow
      ctx.globalAlpha = 0.4
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      ctx.ellipse(isoX, isoY + 50 * zoom, 25 * zoom, 12 * zoom, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      // Outer glow aura (stronger so robot stands out)
      const auraGradient = ctx.createRadialGradient(isoX, isoY, 0, isoX, isoY, 65 * zoom)
      auraGradient.addColorStop(0, 'rgba(183, 148, 246, 0.45)')
      auraGradient.addColorStop(0.4, 'rgba(124, 58, 237, 0.2)')
      auraGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = auraGradient
      ctx.beginPath()
      ctx.arc(isoX, isoY, 65 * zoom, 0, Math.PI * 2)
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
      ctx.fillStyle = '#b794f6'
      ctx.shadowBlur = 20
      ctx.shadowColor = '#b794f6'
      ctx.fillRect(isoX - 14 * zoom, isoY + 35 * zoom, 10 * zoom, 4 * zoom)
      ctx.fillRect(isoX + 4 * zoom, isoY + 35 * zoom, 10 * zoom, 4 * zoom)
      ctx.restore()

      // Main body (torso) with metallic effect
      const bodyGradient = ctx.createLinearGradient(isoX - 20 * zoom, isoY - 10 * zoom, isoX + 20 * zoom, isoY + 20 * zoom)
      bodyGradient.addColorStop(0, '#d8bfff')
      bodyGradient.addColorStop(0.3, '#b794f6')
      bodyGradient.addColorStop(0.6, '#c084fc')
      bodyGradient.addColorStop(1, '#9370db')
      
      ctx.fillStyle = bodyGradient
      ctx.shadowBlur = 30
      ctx.shadowColor = '#b794f6'
      
      ctx.fillRect(isoX - 18 * zoom, isoY - 10 * zoom, 36 * zoom, 28 * zoom)
      
      // Chest core (energy reactor)
      const coreGradient = ctx.createRadialGradient(isoX, isoY + 3 * zoom, 0, isoX, isoY + 3 * zoom, 10 * zoom)
      coreGradient.addColorStop(0, '#7c3aed')
      coreGradient.addColorStop(0.5, '#a855f7')
      coreGradient.addColorStop(1, 'transparent')
      
      ctx.fillStyle = coreGradient
      ctx.shadowBlur = 25
      ctx.shadowColor = '#7c3aed'
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
      ctx.fillStyle = '#c084fc'
      ctx.shadowBlur = 15
      ctx.shadowColor = '#c084fc'
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
      headGradient.addColorStop(0, '#e9d5ff')
      headGradient.addColorStop(0.6, '#c084fc')
      headGradient.addColorStop(1, '#a855f7')
      
      ctx.fillStyle = headGradient
      ctx.shadowBlur = 25
      ctx.shadowColor = '#c084fc'
      ctx.beginPath()
      ctx.arc(isoX, isoY - 25 * zoom, 18 * zoom, 0, Math.PI * 2)
      ctx.fill()
      
      // Visor line
      ctx.strokeStyle = '#b794f6'
      ctx.lineWidth = 2
      ctx.shadowBlur = 15
      ctx.shadowColor = '#b794f6'
      ctx.beginPath()
      ctx.moveTo(isoX - 15 * zoom, isoY - 25 * zoom)
      ctx.lineTo(isoX + 15 * zoom, isoY - 25 * zoom)
      ctx.stroke()
      ctx.shadowBlur = 0

      // Eyes with intense glow
      const eyeGlow = Math.sin(Date.now() / 200) * 0.3 + 0.7
      ctx.fillStyle = `rgba(124, 58, 237, ${eyeGlow})`
      ctx.shadowBlur = 20
      ctx.shadowColor = '#7c3aed'
      
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
      ctx.strokeStyle = '#fbbf24'
      ctx.lineWidth = 3 * zoom
      ctx.shadowBlur = 20
      ctx.shadowColor = '#fbbf24'
      ctx.beginPath()
      ctx.moveTo(isoX, isoY - 43 * zoom)
      ctx.lineTo(isoX, isoY - 50 * zoom)
      ctx.stroke()
      
      // Antenna tip
      ctx.fillStyle = '#fbbf24'
      ctx.shadowBlur = 25
      ctx.beginPath()
      ctx.arc(isoX, isoY - 52 * zoom, 4 * zoom, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Large direction arrow above robot (куда повёрнут)
      ctx.save()
      ctx.translate(isoX, isoY - 58 * zoom)
      ctx.rotate(getDirectionAngle(direction))
      
      const arrowGradient = ctx.createLinearGradient(0, -22 * zoom, 0, 2 * zoom)
      arrowGradient.addColorStop(0, '#fef3c7')
      arrowGradient.addColorStop(0.5, '#fbbf24')
      arrowGradient.addColorStop(1, '#f59e0b')
      
      ctx.fillStyle = arrowGradient
      ctx.shadowBlur = 25
      ctx.shadowColor = '#fbbf24'
      ctx.beginPath()
      ctx.moveTo(0, -22 * zoom)
      ctx.lineTo(14 * zoom, 2 * zoom)
      ctx.lineTo(-14 * zoom, 2 * zoom)
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()

      // Label "Робот" under the robot (so it's clear this is the robot)
      ctx.save()
      ctx.font = `bold ${12 * zoom}px "Rajdhani", sans-serif`
      ctx.fillStyle = '#e9d5ff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.shadowBlur = 12
      ctx.shadowColor = '#b794f6'
      ctx.fillText('РОБОТ', isoX, isoY + 42 * zoom)
      ctx.shadowBlur = 0
      ctx.restore()

      // Energy rings (animated)
      for (let i = 0; i < 3; i++) {
        const ringProgress = (Date.now() / 1500 + i * 0.33) % 1
        const ringRadius = 35 * zoom + ringProgress * 25
        const ringAlpha = (1 - ringProgress) * 0.8
        
        ctx.strokeStyle = `rgba(183, 148, 246, ${ringAlpha})`
        ctx.lineWidth = 3 * (1 - ringProgress * 0.5)
        ctx.shadowBlur = 15
        ctx.shadowColor = 'rgba(183, 148, 246, 0.8)'
        ctx.beginPath()
        ctx.arc(isoX, isoY, ringRadius, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      // Outer hexagon shield
      const shieldProgress = (Date.now() / 2000) % 1
      const shieldRadius = 45 * zoom
      ctx.strokeStyle = `rgba(192, 132, 252, ${0.5 + Math.sin(shieldProgress * Math.PI * 2) * 0.3})`
      ctx.lineWidth = 2
      ctx.shadowBlur = 20
      ctx.shadowColor = '#c084fc'
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
      ctx.save()
      ctx.translate(pan.x, pan.y)

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

      // Draw robot (from history or at start cell if no steps yet)
      if (robotHistory.length > 0) {
        const step = Math.min(Math.floor(currentStepRef.current), robotHistory.length - 1)
        const [rx, ry, dir] = robotHistory[step]
        const progress = currentStepRef.current - step
        drawRobot(rx, ry, dir, progress)
      } else if (startCell) {
        drawRobot(startCell.x, startCell.y, 0, 1)
      }

      ctx.restore()
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
  }, [mapData, robotHistory, zoom, showGrid, pan, startCell])

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
          <motion.button
            className="control-btn"
            onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1) }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Сбросить вид"
          >
            <span className="control-icon">⌂</span>
            Сброс вида
          </motion.button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="isometric-canvas-container"
        onWheel={(e) => {
          e.preventDefault()
          setZoom((z) => Math.min(2, Math.max(0.5, z - e.deltaY * 0.002)))
        }}
        onMouseDown={(e) => {
          if (e.button === 0) {
            setIsDragging(true)
            dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
          }
        }}
        onMouseMove={(e) => {
          if (dragStart.current) {
            setPan({
              x: dragStart.current.panX + e.clientX - dragStart.current.x,
              y: dragStart.current.panY + e.clientY - dragStart.current.y,
            })
          }
        }}
        onMouseUp={() => { setIsDragging(false); dragStart.current = null }}
        onMouseLeave={() => { setIsDragging(false); dragStart.current = null }}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <canvas ref={canvasRef} className="isometric-canvas" />
        
        {/* Holographic overlay effect */}
        <div className="holo-overlay" />
        
        {/* Scan lines */}
        <div className="scan-lines" />
      </div>

      {/* Status indicators */}
      {(() => {
        const lastStep = robotHistory.length > 0
          ? robotHistory[robotHistory.length - 1]
          : (startCell ? [startCell.x, startCell.y, 0] as [number, number, number] : null)
        const dirNames = ['СЕВЕР', 'ВОСТОК', 'ЮГ', 'ЗАПАД']
        const directionText = lastStep != null ? dirNames[lastStep[2]] ?? '—' : '—'
        return (
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
              <span className="status-label">РОБОТ:</span>
              <span className="status-value">
                {lastStep != null ? `клетка [${lastStep[0]}, ${lastStep[1]}]` : '—'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">СМОТРИТ:</span>
              <span className="status-value glow-text">{directionText}</span>
            </div>
            <div className="status-item">
              <span className="status-label">ШАГИ:</span>
              <span className="status-value">{robotHistory.length > 0 ? robotHistory.length - 1 : '0'}</span>
            </div>
          </div>
        )
      })()}
      <p className="canvas-hint">Колёсико мыши — зум • Перетаскивание — панорама</p>
    </div>
  )
}
