export type StyleUpCanvasItem = {
    _id: string
}

export type StyleUpLayout = {
    left: number
    top: number
    width: number
    x: number
    y: number
}

export type StyleUpDragState = {
    id: string
    startClientX: number
    startClientY: number
    startX: number
    startY: number
    minX: number
    maxX: number
    minY: number
    maxY: number
}

export type StyleUpCanvasSession = {
    layouts: Record<string, StyleUpLayout>
    zIndexes: Record<string, number>
    nextZIndex: number
    drag: StyleUpDragState | null
}

const LOAD_MORE_CARD_WIDTH = 18

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value))
}

function createSeededRandom(seed: string) {
    let hash = 2166136261

    for (let index = 0; index < seed.length; index += 1) {
        hash ^= seed.charCodeAt(index)
        hash = Math.imul(hash, 16777619)
    }

    return () => {
        hash += 0x6d2b79f5
        let value = hash

        value = Math.imul(value ^ (value >>> 15), value | 1)
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61)

        return ((value ^ (value >>> 14)) >>> 0) / 4294967296
    }
}

function createRandomLayout(random: () => number): StyleUpLayout {
    const width = 14 + random() * 12
    const halfSize = width / 2
    const left = random() * 100
    const top = random() * 100

    return {
        left: clamp(left, halfSize, 100 - halfSize),
        top: clamp(top, halfSize, 100 - halfSize),
        width,
        x: 0,
        y: 0,
    }
}

export function createStyleUpCanvasSession({
    styleUps,
    random,
}: {
    styleUps: StyleUpCanvasItem[] | null
    random?: () => number
}): StyleUpCanvasSession {
    const layouts: Record<string, StyleUpLayout> = {}

    styleUps?.forEach((styleUp, index) => {
        layouts[styleUp._id] = createRandomLayout(
            random ?? createSeededRandom(`${styleUp._id}:${index}`),
        )
    })

    return {
        drag: null,
        layouts,
        zIndexes: {},
        nextZIndex: styleUps?.length ? styleUps.length + 1 : 1,
    }
}

export function bringStyleUpToFront(
    session: StyleUpCanvasSession,
    id: string,
): StyleUpCanvasSession {
    return {
        ...session,
        zIndexes: {
            ...session.zIndexes,
            [id]: session.nextZIndex,
        },
        nextZIndex: session.nextZIndex + 1,
    }
}

export function startStyleUpDrag(
    session: StyleUpCanvasSession,
    {
        id,
        clientX,
        clientY,
        bounds,
    }: {
        id: string
        clientX: number
        clientY: number
        bounds?: StyleUpDragBounds
    },
): StyleUpCanvasSession {
    const layout = session.layouts[id]

    if (!layout) return session

    const dragBounds = bounds ? getStyleUpDragOffsetBounds(layout, bounds) : null

    return {
        ...session,
        drag: {
            id,
            startClientX: clientX,
            startClientY: clientY,
            startX: layout.x,
            startY: layout.y,
            minX: dragBounds?.minX ?? Number.NEGATIVE_INFINITY,
            maxX: dragBounds?.maxX ?? Number.POSITIVE_INFINITY,
            minY: dragBounds?.minY ?? Number.NEGATIVE_INFINITY,
            maxY: dragBounds?.maxY ?? Number.POSITIVE_INFINITY,
        },
    }
}

export function moveStyleUpDrag(
    session: StyleUpCanvasSession,
    {
        clientX,
        clientY,
    }: {
        clientX: number
        clientY: number
    },
): StyleUpCanvasSession {
    const drag = session.drag

    if (!drag) return session

    const layout = session.layouts[drag.id]

    if (!layout) return session

    return {
        ...session,
        layouts: {
            ...session.layouts,
            [drag.id]: {
                ...layout,
                x: clamp(drag.startX + clientX - drag.startClientX, drag.minX, drag.maxX),
                y: clamp(drag.startY + clientY - drag.startClientY, drag.minY, drag.maxY),
            },
        },
    }
}

export type StyleUpDragBounds = {
    canvasWidth: number
    canvasHeight: number
    cardWidth: number
    cardHeight: number
    boundaryLeft?: number
    boundaryTop?: number
    boundaryRight?: number
    boundaryBottom?: number
}

export function getStyleUpDragOffsetBounds(
    layout: StyleUpLayout,
    {
        canvasWidth,
        canvasHeight,
        cardWidth,
        cardHeight,
        boundaryLeft = 0,
        boundaryTop = 0,
        boundaryRight = canvasWidth,
        boundaryBottom = canvasHeight,
    }: StyleUpDragBounds,
) {
    const centerX = (layout.left / 100) * canvasWidth
    const centerY = (layout.top / 100) * canvasHeight
    const halfCardWidth = cardWidth / 2
    const halfCardHeight = cardHeight / 2

    return {
        minX: boundaryLeft + halfCardWidth - centerX,
        maxX: boundaryRight - halfCardWidth - centerX,
        minY: boundaryTop + halfCardHeight - centerY,
        maxY: boundaryBottom - halfCardHeight - centerY,
    }
}

export function endStyleUpDrag(session: StyleUpCanvasSession): StyleUpCanvasSession {
    return {
        ...session,
        drag: null,
    }
}

export function getStyleUpCanvasHeight(count: number) {
    const rows = Math.max(2, Math.ceil(count / 3))

    return `max(calc(100% - 60px), ${Math.max(660, rows * 260)}px)`
}

export function getStyleUpLoadMoreLayout(count: number): StyleUpLayout {
    const positions = [22, 46, 70]

    return {
        left: positions[count % positions.length],
        top: 90,
        width: LOAD_MORE_CARD_WIDTH,
        x: 0,
        y: 0,
    }
}
