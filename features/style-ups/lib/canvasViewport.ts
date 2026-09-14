export type CanvasPoint = {x: number; y: number}
export type CanvasView = CanvasPoint & {scale: number}

export function resizeCanvasView(view: CanvasView, before: {width: number; height: number}, after: {width: number; height: number}): CanvasView {
    return {
        ...view,
        x: view.x - (after.width - before.width) * view.scale / 2,
        y: view.y - (after.height - before.height) * view.scale / 2,
    }
}

export function moveCanvasView(view: CanvasView, before: CanvasPoint[], after: CanvasPoint[], maxScale = 6): CanvasView {
    const center = (points: CanvasPoint[]) => ({
        x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
        y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
    })
    const from = center(before)
    const to = center(after)
    const distance = (points: CanvasPoint[]) => Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y)
    const ratio = before.length === 2 && distance(before) > 0 ? distance(after) / distance(before) : 1
    const scale = Math.max(0.9, Math.min(maxScale, view.scale * ratio))
    return {
        scale,
        x: to.x - (from.x - view.x) * scale / view.scale,
        y: to.y - (from.y - view.y) * scale / view.scale,
    }
}

export function boundCanvasView(view: CanvasView, viewport: {width: number; height: number}, canvas: {width: number; height: number}): CanvasView {
    const bound = (offset: number, size: number, available: number) => size <= available
        ? (available - size) / 2
        : Math.max(available - size, Math.min(0, offset))
    return {
        ...view,
        x: bound(view.x, canvas.width * view.scale, viewport.width),
        y: bound(view.y, canvas.height * view.scale, viewport.height),
    }
}

export type CanvasBounds = {left: number; top: number; width: number; height: number}

export function boundStyleUpCanvasView(view: CanvasView, width: number, height: number, bounds: CanvasBounds): CanvasView {
    const offsetX = bounds.left * view.scale
    const offsetY = bounds.top * view.scale
    const bounded = boundCanvasView({...view, x: view.x + offsetX, y: view.y + offsetY},
        {width, height}, bounds)
    return {...bounded, x: bounded.x - offsetX, y: bounded.y - offsetY}
}
