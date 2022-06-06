import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { ChartEntry, useEntryStore } from './ChartEntries'
import { useChartSettingsStore } from './ChartSettings'

export interface Point {
  x: number
  y: number
}

export function ChartCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [baseCanvas] = useState(
    document.createElement('canvas') as HTMLCanvasElement,
  )
  const [upperCanvas] = useState(
    document.createElement('canvas') as HTMLCanvasElement,
  )

  const topLabel = useChartSettingsStore((state) => state.topLabel)
  const rightLabel = useChartSettingsStore((state) => state.rightLabel)
  const bottomLabel = useChartSettingsStore((state) => state.bottomLabel)
  const leftLabel = useChartSettingsStore((state) => state.leftLabel)
  const labelSize = useChartSettingsStore((state) => state.labelSize)
  const entryNameSize = useChartSettingsStore((state) => state.entryNameSize)
  const chartSize = useChartSettingsStore((state) => state.chartSize)
  const gridSize = useChartSettingsStore((state) => state.gridSize)
  const arrowSize = useChartSettingsStore((state) => state.arrowSize)
  const chartColor = useChartSettingsStore((state) => state.chartColor)
  const axisColor = useChartSettingsStore((state) => state.axisColor)
  const gridColor = useChartSettingsStore((state) => state.gridColor)

  const entries = useEntryStore((state) => state.entries)
  const updateEntry = useEntryStore((state) => state.updateEntry)

  const composeCanvases = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(baseCanvas, 0, 0)
    ctx.drawImage(upperCanvas, 0, 0)
  }, [canvasRef, baseCanvas, upperCanvas])

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    baseCanvas.width = canvas.width
    baseCanvas.height = canvas.height

    // Render first to a temp canvas and then copy it after
    // This reduces "flickering" when adjusting settings
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = baseCanvas.width
    tempCanvas.height = baseCanvas.height
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    drawCanvasChart({
      canvas: tempCanvas,
      ctx: tempCtx,
      topLabel,
      rightLabel,
      bottomLabel,
      leftLabel,
      labelSize,
      gridSize,
      arrowSize,
      chartColor,
      axisColor,
      gridColor,
    })

    // Copy the temp canvas to the real canvas
    const ctx = baseCanvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(tempCanvas, 0, 0)
    composeCanvases()
  }, [
    canvasRef,
    topLabel,
    rightLabel,
    bottomLabel,
    leftLabel,
    labelSize,
    chartSize,
    gridSize,
    arrowSize,
    chartColor,
    axisColor,
    gridColor,
  ])

  const drawEntries = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    upperCanvas.width = canvas.width
    upperCanvas.height = canvas.height

    const ctx = upperCanvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, upperCanvas.width, upperCanvas.height)

    drawCanvasEntries({
      canvas: upperCanvas,
      ctx,
      entryNameSize,
      entries,
    })
    composeCanvases()
  }, [chartSize, entryNameSize, entries])

  const [clickedEntry, setClickedEntry] = useState<ChartEntry | null>(null)

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const mouseCoords = { x: e.clientX, y: e.clientY }
      // Convert from local coords to canvas coords, where (0, 0) is the top-left
      const canvasCoords = localCoordsToCanvasCoords(canvas, mouseCoords)
      // Convert from canvas coords to chart coords, where (0, 0) is the center
      const coords = canvasToEntryCoords(canvas, canvasCoords)

      const entry = entries
        .slice()
        .reverse()
        .find((entry) => {
          return (
            Math.abs(entry.coords.x - coords.x) < 10 &&
            Math.abs(entry.coords.y - coords.y) < 10
          )
        })

      if (entry) {
        setClickedEntry(entry)
      }
    },
    [canvasRef, entries],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas || !clickedEntry) return

      const mouseCoords = { x: e.clientX, y: e.clientY }
      const canvasCoords = localCoordsToCanvasCoords(canvas, mouseCoords)
      const coords = canvasToEntryCoords(canvas, canvasCoords)
      updateEntry({ ...clickedEntry, coords })
    },
    [canvasRef, clickedEntry],
  )

  const handleMouseUp = () => setClickedEntry(null)

  useEffect(drawChart, [drawChart])
  useEffect(drawEntries, [drawEntries])

  return (
    <main>
      <canvas
        ref={canvasRef}
        class="canvas"
        style={`background-color: ${chartColor}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        width={chartSize}
        height={chartSize}
      >
        Your browser does not support the HTML5 canvas tag. How old is it???
      </canvas>
    </main>
  )
}

interface CanvasDrawing {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
}

interface CanvasChartDrawing extends CanvasDrawing {
  topLabel: string
  leftLabel: string
  bottomLabel: string
  rightLabel: string
  labelSize: number
  gridSize: number
  arrowSize: number
  chartColor: string
  axisColor: string
  gridColor: string
}

function drawCanvasChart({
  canvas,
  ctx,
  topLabel,
  leftLabel,
  bottomLabel,
  rightLabel,
  labelSize,
  gridSize,
  arrowSize,
  chartColor,
  axisColor,
  gridColor,
}: CanvasChartDrawing) {
  const { width, height } = canvas
  const halfWidth = width / 2
  const halfWidthPixel = halfWidth % 2 ? halfWidth + 0.5 : halfWidth
  const halfHeight = height / 2
  const halfHeightPixel = halfHeight % 2 ? halfHeight + 0.5 : halfHeight

  // Clear Canvas
  ctx.clearRect(0, 0, width, height)

  // White background
  ctx.fillStyle = chartColor
  ctx.fillRect(0, 0, width, height)

  if (gridSize > 0) {
    // Draw the vertical grid
    ctx.strokeStyle = gridColor

    for (let i = halfHeight; i > 0; i -= gridSize) {
      drawLine(ctx, { x: 0, y: i }, { x: width, y: i })
    }

    for (let i = halfHeight; i < height; i += gridSize) {
      drawLine(ctx, { x: 0, y: i }, { x: width, y: i })
    }

    // Draw the horizontal grid
    for (let i = halfWidth; i > 0; i -= gridSize) {
      drawLine(ctx, { x: i, y: 0 }, { x: i, y: height })
    }

    for (let i = halfWidth; i < width; i += gridSize) {
      drawLine(ctx, { x: i, y: 0 }, { x: i, y: height })
    }
  }

  // Draw the Y axis
  ctx.strokeStyle = axisColor
  drawLine(ctx, { x: halfWidthPixel, y: 0 }, { x: halfWidthPixel, y: height })

  // ^ arrow
  ctx.fillStyle = axisColor
  ctx.beginPath()
  ctx.moveTo(halfWidth, 0)
  ctx.lineTo(halfWidth - arrowSize, arrowSize)
  ctx.lineTo(halfWidth + arrowSize, arrowSize)
  ctx.closePath()
  ctx.fill()

  // > arrow
  ctx.beginPath()
  ctx.moveTo(width, halfHeight)
  ctx.lineTo(width - arrowSize, halfHeight - arrowSize)
  ctx.lineTo(width - arrowSize, halfHeight + arrowSize)
  ctx.closePath
  ctx.fill()

  // Draw the X axis
  drawLine(ctx, { x: 0, y: halfHeightPixel }, { x: width, y: halfHeightPixel })

  // Draw the axis labels
  ctx.fillStyle = axisColor
  ctx.font = `${labelSize}px sans-serif`

  const arrowOffset = Math.max(arrowSize, 10)

  ctx.fillText(topLabel, halfWidth + 10, arrowOffset + 20)

  const { width: rightLabelWidth } = ctx.measureText(rightLabel)
  ctx.fillText(
    rightLabel,
    width - rightLabelWidth - arrowOffset,
    halfHeight + 30,
  )

  ctx.fillText(bottomLabel, halfWidth + 10, height - 10)

  ctx.fillText(leftLabel, 10, halfHeight + 30)
}

interface CanvasEntriesDrawing extends CanvasDrawing {
  entryNameSize: number
  entries: ChartEntry[]
}

function drawCanvasEntries({
  canvas,
  ctx,
  entryNameSize,
  entries,
}: CanvasEntriesDrawing) {
  for (const entry of entries) {
    drawEntry({ canvas, ctx, entryNameSize, entry })
  }
}

interface CanvasEntryDrawing extends CanvasDrawing {
  entryNameSize: number
  entry: ChartEntry
}

function drawEntry({ canvas, ctx, entryNameSize, entry }: CanvasEntryDrawing) {
  const { width } = canvas

  const coords = entryToCanvasCoords(canvas, entry.coords)
  ctx.fillStyle = entry.color
  drawCircle(ctx, coords, 10)

  ctx.font = `${entryNameSize}px sans-serif`

  const { width: labelWidth, actualBoundingBoxAscent } = ctx.measureText(
    entry.name,
  )

  const offset = 12
  const labelCoords = { x: coords.x + offset, y: coords.y - offset }
  const labelX =
    labelCoords.x + labelWidth > width
      ? coords.x - labelWidth - offset
      : labelCoords.x

  const labelY =
    labelCoords.y - actualBoundingBoxAscent < 0
      ? coords.y + actualBoundingBoxAscent + offset
      : labelCoords.y

  ctx.fillText(entry.name, labelX, labelY)
}

function entryToCanvasCoords(canvas: HTMLCanvasElement, coords: Point): Point {
  const { width, height } = canvas
  const halfWidth = width / 2
  const halfHeight = height / 2

  return {
    x: halfWidth + coords.x,
    y: halfHeight - coords.y,
  }
}

function canvasToEntryCoords(canvas: HTMLCanvasElement, coords: Point): Point {
  const { width, height } = canvas
  const halfWidth = width / 2
  const halfHeight = height / 2

  return {
    x: coords.x - halfWidth,
    y: halfHeight - coords.y,
  }
}

function localCoordsToCanvasCoords(
  canvas: HTMLCanvasElement,
  coords: Point,
): Point {
  const rect = canvas.getBoundingClientRect()

  // Get the x,y coords based on the canvas size
  // top-left = (0, 0)
  // bottom-right = (canvas.width, canvas.height)
  // not perfectly accurate since floating-point, but good enough
  const x = ((coords.x - rect.x) / rect.width) * canvas.width
  const y = ((coords.y - rect.y) / rect.height) * canvas.height

  return { x, y }
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  start: Point,
  end: Point,
): void {
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  center: Point,
  radius: number,
): void {
  ctx.beginPath()
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI)
  ctx.fill()
}
