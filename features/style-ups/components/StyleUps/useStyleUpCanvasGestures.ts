'use client'

import {useEffect, useRef, useState, type RefObject} from 'react'
import {boundStyleUpCanvasView, moveCanvasView, softenCanvasEdge, stepCanvasMomentum, type CanvasBounds, type CanvasPoint, type CanvasView} from '../../lib/canvasViewport'

export function useStyleUpCanvasGestures(viewportRef: RefObject<HTMLDivElement | null>, canvasRef: RefObject<HTMLDivElement | null>, extent: CanvasBounds | null) {
    const [visibleView, setVisibleView] = useState({x: 0, y: 0, scale: 1.2, width: 0, height: 0})
    const bounds = useRef(extent)
    const controls = useRef<{zoom: (factor: number) => void; reset: () => void; refresh: () => void}>({zoom: () => {}, reset: () => {}, refresh: () => {}})

    useEffect(() => {
        bounds.current = extent
        controls.current.refresh()
    }, [extent])

    useEffect(() => {
        const viewport = viewportRef.current
        const canvas = canvasRef.current
        if (!viewport || !canvas) return

        const mobile = window.matchMedia('(max-width: 768px)')
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
        const initialScale = window.matchMedia('(hover: none) and (pointer: coarse)').matches ? 0.9 : 1.2
        const maxScale = () => mobile.matches ? 6 : 3
        let view: CanvasView = {x: 0, y: 0, scale: initialScale}
        const pointers = new Map<number, CanvasPoint>()
        let moved = false
        let pinched = false
        let origin: CanvasPoint | null = null
        let safariScale: number | null = null
        let momentumFrame = 0
        let velocity = {x: 0, y: 0}
        let lastMoveTime = 0
        let rawView = view
        const stopMomentum = () => {
            cancelAnimationFrame(momentumFrame)
            momentumFrame = 0
            velocity = {x: 0, y: 0}
        }
        let viewportSize = {width: viewport.clientWidth, height: viewport.clientHeight}
        const constrain = (next: CanvasView) => bounds.current === null ? next : boundStyleUpCanvasView(
                next, viewport.clientWidth, viewport.clientHeight, bounds.current,
            )
        const paint = (next: CanvasView, allowOverscroll = false) => {
            view = allowOverscroll ? next : constrain(next)
            setVisibleView({...view, width: viewport.clientWidth, height: viewport.clientHeight})
            canvas.style.setProperty('--canvas-x', `${view.x}px`)
            canvas.style.setProperty('--canvas-y', `${view.y}px`)
            canvas.style.setProperty('--canvas-scale', String(view.scale))
        }
        const release = () => {
            let previousTime = performance.now()
            const animate = (time: number) => {
                if (reducedMotion.matches || viewport.closest('[inert]')) {
                    stopMomentum()
                    paint(view)
                    return
                }
                const next = stepCanvasMomentum(view, velocity, constrain(view), time - previousTime)
                previousTime = time
                velocity = next.velocity
                paint(next.view, !next.settled)
                momentumFrame = next.settled ? 0 : requestAnimationFrame(animate)
            }
            momentumFrame = requestAnimationFrame(animate)
        }
        const reset = () => {
            stopMomentum()
            paint({x: viewport.clientWidth / 2, y: viewport.clientHeight / 2, scale: initialScale})
        }
        const zoomAt = (factor: number, center: CanvasPoint) => {
            stopMomentum()
            paint(moveCanvasView(view,
                [{x: center.x - 50, y: center.y}, {x: center.x + 50, y: center.y}],
                [{x: center.x - 50 * factor, y: center.y}, {x: center.x + 50 * factor, y: center.y}],
                maxScale(),
            ))
        }
        const zoom = (factor: number) => zoomAt(factor, {
            x: viewport.clientWidth / 2, y: viewport.clientHeight / 2,
        })
        const constrainZoom = () => zoom(1)
        mobile.addEventListener('change', constrainZoom)
        controls.current = {zoom, reset, refresh: () => paint(view, pointers.size > 0 || momentumFrame !== 0)}
        const wheel = (event: WheelEvent) => {
            event.preventDefault()
            event.stopPropagation()
            if (safariScale !== null) return
            stopMomentum()
            const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1
            if (!event.ctrlKey) {
                paint({
                    ...view,
                    x: view.x - event.deltaX * unit,
                    y: view.y - event.deltaY * unit,
                })
                return
            }
            const rect = viewport.getBoundingClientRect()
            zoomAt(Math.exp(-event.deltaY * unit * 0.01), {
                x: event.clientX - rect.left - canvas.offsetLeft,
                y: event.clientY - rect.top - canvas.offsetTop,
            })
        }
        // Safari exposes trackpad pinches through gesture events.
        const gesture = (event: Event) => {
            if (pointers.size > 0) return
            const pinch = event as Event & {scale: number; clientX: number; clientY: number}
            event.preventDefault()
            if (event.type === 'gesturestart') {
                stopMomentum()
                safariScale = pinch.scale
            } else if (event.type === 'gestureend') {
                safariScale = null
            } else if (safariScale !== null && pinch.scale > 0) {
                const rect = viewport.getBoundingClientRect()
                zoomAt(pinch.scale / safariScale, {
                    x: pinch.clientX - rect.left - canvas.offsetLeft,
                    y: pinch.clientY - rect.top - canvas.offsetTop,
                })
                safariScale = pinch.scale
            }
        }
        const point = (event: PointerEvent) => {
            const rect = viewport.getBoundingClientRect()
            return {x: event.clientX - rect.left, y: event.clientY - rect.top}
        }
        const down = (event: PointerEvent) => {
            if (event.button !== 0) return
            event.stopPropagation()
            if (pointers.size >= 2) return
            stopMomentum()
            rawView = view
            lastMoveTime = performance.now()
            if (pointers.size === 0) {
                moved = false
                pinched = false
                origin = point(event)
            } else {
                moved = true
                pinched = true
            }
            pointers.set(event.pointerId, point(event))
            // Preserve normal button taps; capture them only once a pan starts.
            if (!(event.target instanceof Element && event.target.closest('button'))) {
                viewport.setPointerCapture(event.pointerId)
            }
        }
        const move = (event: PointerEvent) => {
            if (!pointers.has(event.pointerId)) return
            event.stopPropagation()
            const before = [...pointers.values()]
            const next = point(event)
            pointers.set(event.pointerId, next)
            if (origin && Math.hypot(next.x - origin.x, next.y - origin.y) > 5) moved = true
            if (moved && !viewport.hasPointerCapture(event.pointerId)) viewport.setPointerCapture(event.pointerId)
            const time = performance.now()
            // Fingers rarely lift together after a pinch. Do not turn the remaining
            // finger's last movement into a swipe or an overscroll spring.
            const elastic = event.pointerType === 'touch' && pointers.size === 1
                && !pinched && !reducedMotion.matches
            const previousView = view
            rawView = moveCanvasView(elastic ? rawView : view, before, [...pointers.values()], maxScale())
            paint(elastic ? softenCanvasEdge(rawView, constrain(rawView)) : rawView, elastic)
            const elapsed = Math.max(1, time - lastMoveTime)
            velocity = elastic ? {
                x: Math.max(-3, Math.min(3, (view.x - previousView.x) / elapsed)),
                y: Math.max(-3, Math.min(3, (view.y - previousView.y) / elapsed)),
            } : {x: 0, y: 0}
            lastMoveTime = time
        }
        const up = (event: PointerEvent) => {
            if (!pointers.has(event.pointerId)) return
            event.stopPropagation()
            pointers.delete(event.pointerId)
            if (event.type === 'pointercancel') moved = true
            if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId)
            origin = pointers.values().next().value ?? null
            rawView = view
            if (pointers.size === 0) {
                if (event.pointerType === 'touch' && !pinched && !reducedMotion.matches) {
                    if (event.type !== 'pointerup' || performance.now() - lastMoveTime > 80) velocity = {x: 0, y: 0}
                    release()
                } else {
                    paint(view)
                }
            } else {
                velocity = {x: 0, y: 0}
                lastMoveTime = performance.now()
            }
        }
        const click = (event: MouseEvent) => {
            if (moved && event.detail !== 0) {
                event.preventDefault()
                event.stopPropagation()
            }
        }
        const keydown = (event: KeyboardEvent) => {
            if (event.target !== viewport) return
            const moves: Record<string, CanvasPoint> = {
                ArrowLeft: {x: 60, y: 0}, ArrowRight: {x: -60, y: 0},
                ArrowUp: {x: 0, y: 60}, ArrowDown: {x: 0, y: -60},
            }
            if (moves[event.key]) {
                stopMomentum()
                event.preventDefault()
                paint({...view, x: view.x + moves[event.key].x, y: view.y + moves[event.key].y})
            }
        }
        const breakpoint = () => {
            for (const id of pointers.keys()) {
                if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id)
            }
            pointers.clear()
            safariScale = null
            viewport.tabIndex = 0
            reset()
        }
        breakpoint()
        const observer = new ResizeObserver(() => {
            stopMomentum()
            const nextSize = {width: viewport.clientWidth, height: viewport.clientHeight}
            paint({...view, x: view.x + (nextSize.width - viewportSize.width) / 2,
                y: view.y + (nextSize.height - viewportSize.height) / 2})
            viewportSize = nextSize
        })
        observer.observe(viewport)
        viewport.addEventListener('pointerdown', down, true)
        viewport.addEventListener('pointermove', move, true)
        viewport.addEventListener('pointerup', up, true)
        viewport.addEventListener('pointercancel', up, true)
        viewport.addEventListener('lostpointercapture', up, true)
        viewport.addEventListener('click', click, true)
        viewport.addEventListener('keydown', keydown)
        viewport.addEventListener('wheel', wheel, {passive: false})
        viewport.addEventListener('gesturestart', gesture, {passive: false})
        viewport.addEventListener('gesturechange', gesture, {passive: false})
        viewport.addEventListener('gestureend', gesture, {passive: false})
        return () => {
            stopMomentum()
            mobile.removeEventListener('change', constrainZoom)
            observer.disconnect()
            viewport.removeEventListener('pointerdown', down, true)
            viewport.removeEventListener('pointermove', move, true)
            viewport.removeEventListener('pointerup', up, true)
            viewport.removeEventListener('pointercancel', up, true)
            viewport.removeEventListener('lostpointercapture', up, true)
            viewport.removeEventListener('click', click, true)
            viewport.removeEventListener('keydown', keydown)
            viewport.removeEventListener('wheel', wheel)
            viewport.removeEventListener('gesturestart', gesture)
            viewport.removeEventListener('gesturechange', gesture)
            viewport.removeEventListener('gestureend', gesture)
        }
    }, [viewportRef, canvasRef])

    return {
        visibleView,
        zoomIn: () => controls.current.zoom(1.25),
        zoomOut: () => controls.current.zoom(0.8),
        reset: () => controls.current.reset(),
    }
}
