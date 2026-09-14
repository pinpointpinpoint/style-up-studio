import type {CanvasView} from './canvasViewport'

const SPACING = 260

// Six columns make the initial 30 photos a complete five-row rectangle.
// Additional pages append rows without moving existing cards.
export function getCanvasLayout(count: number) {
    const columns = Math.min(6, Math.max(1, count))
    const rows = Math.max(1, Math.ceil(count / columns))
    return {
        columns, rows,
        left: -columns * SPACING / 2,
        top: -Math.min(5, rows) * SPACING / 2,
        width: columns * SPACING,
        height: rows * SPACING,
    }
}

export function isNearCanvasEdge(view: CanvasView, width: number, height: number, bounds: ReturnType<typeof getCanvasLayout>) {
    if (!width || !height) return false
    const margin = 100
    return view.x + bounds.left * view.scale >= -margin
        || view.y + bounds.top * view.scale >= -margin
        || view.x + (bounds.left + bounds.width) * view.scale <= width + margin
        || view.y + (bounds.top + bounds.height) * view.scale <= height + margin
}

// Repeat the completed rectangle; fill only the last row's unused cells.
export function createCanvasTile(count: number) {
    if (!count) return []
    const {columns, rows} = getCanvasLayout(count)
    const tile = Array.from({length: columns * rows}, (_, index) => index < count ? index : -1)
    tile.forEach((item, cell) => {
        if (item !== -1) return
        const x = cell % columns
        const y = Math.floor(cell / columns)
        const neighbors = new Set<number>()
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx || dy) neighbors.add(tile[((y + dy + rows) % rows) * columns + (x + dx + columns) % columns])
            }
        }
        let candidate = cell % count
        for (let attempt = 0; attempt < count && neighbors.has(candidate); attempt++) {
            candidate = (candidate + 1) % count
        }
        tile[cell] = candidate
    })
    return tile
}

export function getRepeatingCanvasCells(view: CanvasView, width: number, height: number, count: number, tile: number[] | null = null) {
    if (count === 0 || !width || !height) return []
    const cells = []
    const layout = getCanvasLayout(count)
    const originX = layout.left + SPACING / 2
    const originY = layout.top + SPACING / 2
    const left = Math.floor((-view.x / view.scale - originX) / SPACING) - 1
    const right = Math.ceil(((width - view.x) / view.scale - originX) / SPACING) + 1
    const top = Math.floor((-view.y / view.scale - originY) / SPACING) - 1
    const bottom = Math.ceil(((height - view.y) / view.scale - originY) / SPACING) + 1
    const wrap = (coordinate: number, size: number) => (coordinate % size + size) % size
    for (let y = top; y <= bottom; y++) {
        for (let x = left; x <= right; x++) {
            const index = y * layout.columns + x
            if (!tile && (x < 0 || x >= layout.columns || y < 0 || index >= count)) continue
            const seed = Math.imul(x, 73856093) ^ Math.imul(y, 19349663)
            cells.push({
                key: `${x}:${y}`,
                index,
                itemIndex: tile ? tile[wrap(y, layout.rows) * layout.columns + wrap(x, layout.columns)] : index,
                x: originX + x * SPACING + ((seed >>> 0) % 61) - 30,
                y: originY + y * SPACING + ((Math.imul(seed, 83492791) >>> 0) % 61) - 30,
            })
        }
    }
    return cells
}
