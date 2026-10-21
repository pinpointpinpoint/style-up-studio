export type CanvasPoint = {x: number; y: number}
export type CanvasView = CanvasPoint & {scale: number}

export function softenCanvasEdge(view: CanvasView, bounded: CanvasView): CanvasView {
    const soften = (distance: number) => 100 * distance / (100 + Math.abs(distance))
    return {...view, x: bounded.x + soften(view.x - bounded.x), y: bounded.y + soften(view.y - bounded.y)}
}

// Velocity is measured in pixels per millisecond; the spring returns overscroll to bounds.
export function stepCanvasMomentum(view: CanvasView, velocity: CanvasPoint, bounded: CanvasView, elapsed: number) {
    const dt = Math.min(32, Math.max(0, elapsed))
    const axis = (position: number, speed: number, target: number) => {
        const outside = Math.abs(target - position) > 0.1
        const nextSpeed = (speed + (target - position) * 0.0003 * dt)
            * Math.exp(-(outside ? 0.018 : 0.0045) * dt)
        return {position: position + nextSpeed * dt, speed: nextSpeed}
    }
    const x = axis(view.x, velocity.x, bounded.x)
    const y = axis(view.y, velocity.y, bounded.y)
    return {
        view: {...view, x: x.position, y: y.position},
        velocity: {x: x.speed, y: y.speed},
        settled: Math.hypot(x.speed, y.speed) < 0.015
            && Math.hypot(view.x - bounded.x, view.y - bounded.y) < 0.5,
    }
}

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
