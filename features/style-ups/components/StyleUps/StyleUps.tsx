'use client'

import { urlFor } from '@/sanity/lib/utils'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { type CSSProperties, type PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {getMagnifierGeometry} from '@/features/style-ups/lib/magnifierGeometry'
import {createCanvasTile, getCanvasLayout, getRepeatingCanvasCells, isNearCanvasEdge} from '@/features/style-ups/lib/repeatingCanvas'
import SectionFooterScroll from '@/features/site-shell/components/SectionFooterScroll/SectionFooterScroll'
import styles from './StyleUps.module.css'
import {useStyleUpCanvasGestures} from './useStyleUpCanvasGestures'

export type StyleUpItem = {
    _id: string
    _createdAt: string
    name?: string | null
    image?: SanityImageSource | null
}

type StyleUpsProps = {
    styleUps: StyleUpItem[] | null
    hasMore: boolean
    isLoading: boolean
    loadError: boolean
    onLoadMore: () => void
    onHoverNameChange?: (name: string | null) => void
}

const IMAGE_SIZE = 3240

function imageUrl(image: SanityImageSource) {
    return urlFor(image).width(IMAGE_SIZE).height(IMAGE_SIZE).fit('crop').quality(90).auto('format').url()
}

export function StyleUps({ styleUps, hasMore, isLoading, loadError, onLoadMore, onHoverNameChange }: StyleUpsProps) {
    const [magnifier, setMagnifier] = useState<{
        item: StyleUpItem
        cellKey: string
        geometry: ReturnType<typeof getMagnifierGeometry>
    } | null>(null)
    const hoveredCard = useRef<{
        item: StyleUpItem; cellKey: string; element: HTMLDivElement; clientX: number; clientY: number
    } | null>(null)
    const sidebarRef = useRef<HTMLElement | null>(null)
    const [sidebarAspectRatio, setSidebarAspectRatio] = useState(1)
    const styleUpsRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLDivElement | null>(null)
    const imageSources = useMemo(() => new Map((styleUps ?? []).map(item => [
        item._id, item.image ? imageUrl(item.image) : undefined,
    ])), [styleUps])
    const count = styleUps?.length ?? 0
    const extent = useMemo(() => getCanvasLayout(count), [count])
    const tile = useMemo(() => hasMore ? null : createCanvasTile(count), [hasMore, count])
    const {zoomIn, zoomOut, visibleView} = useStyleUpCanvasGestures(
        styleUpsRef, canvasRef, hasMore ? extent : null,
    )
    const cells = useMemo(() => getRepeatingCanvasCells(
        visibleView, visibleView.width, visibleView.height, count, tile,
    ), [visibleView, count, tile])
    const nearEdge = isNearCanvasEdge(visibleView, visibleView.width, visibleView.height, extent)

    const lastLoadView = useRef<string | null>(null)
    const viewKey = `${visibleView.x}:${visibleView.y}:${visibleView.scale}:${visibleView.width}:${visibleView.height}`

    const updateMagnifier = useCallback(() => {
        const hovered = hoveredCard.current
        if (!hovered) return
        const rect = hovered.element.getBoundingClientRect()
        const x = hovered.clientX - rect.left
        const y = hovered.clientY - rect.top
        if (!hovered.element.isConnected || !rect.width || !rect.height
            || x < 0 || y < 0 || x > rect.width || y > rect.height) {
            setMagnifier(null)
            return
        }
        setMagnifier({
            item: hovered.item,
            cellKey: hovered.cellKey,
            geometry: getMagnifierGeometry(x, y, rect.width, rect.height, sidebarAspectRatio),
        })
    }, [sidebarAspectRatio])

    const handlePointerMove =
        (item: StyleUpItem, cellKey: string) => (event: ReactPointerEvent<HTMLDivElement>) => {
            hoveredCard.current = {item, cellKey, element: event.currentTarget,
                clientX: event.clientX, clientY: event.clientY}
            updateMagnifier()
        }

    useEffect(() => {
        // Wheel/pinch zoom can resize a card while the pointer stays stationary.
        const frame = requestAnimationFrame(updateMagnifier)
        return () => cancelAnimationFrame(frame)
    }, [viewKey, updateMagnifier])

    useEffect(() => {
        const sidebar = sidebarRef.current
        if (!sidebar) return

        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect

            if (width && height) {
                setSidebarAspectRatio(width / height)
            }
        })

        observer.observe(sidebar)

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (hasMore && !isLoading && !loadError && nearEdge
            && lastLoadView.current !== viewKey && !styleUpsRef.current?.closest('[inert]')) {
            lastLoadView.current = viewKey
            onLoadMore()
        }
    }, [hasMore, isLoading, loadError, onLoadMore, count, nearEdge, viewKey])

    if (!styleUps || styleUps.length === 0) return null

    return (
        <SectionFooterScroll>
            <div className={styles.main}>
                <div ref={styleUpsRef} className={styles.styleUps} role="region" aria-label="Style Ups canvas">
                    <div
                        ref={canvasRef}
                        className={styles.canvas}
                    >
                        {cells.map((cell) => {
                                const su = styleUps[cell.itemIndex]

                                return (
                                    <div
                                        key={cell.key}
                                        className={styles.card}
                                        style={{
                                            '--card-offset-x': `${cell.x}px`,
                                            '--card-offset-y': `${cell.y}px`,
                                        } as CSSProperties}
                                        onPointerEnter={(event) => onHoverNameChange?.(
                                            event.pointerType === 'mouse' ? su.name?.trim() || null : null,
                                        )}
                                        onPointerMove={handlePointerMove(su, cell.key)}
                                        onPointerLeave={() => {
                                            hoveredCard.current = null
                                            setMagnifier(null)
                                            onHoverNameChange?.(null)
                                        }}
                                    >
                                        {su.image && (
                                            <img
                                                src={imageSources.get(su._id)}
                                                decoding="async"
                                                alt={`Style up image for ${su.name ?? 'style up'}`}
                                                draggable={false}
                                            />
                                        )}

                                        {magnifier?.cellKey === cell.key && (
                                            <div
                                                className={styles.magnifierLens}
                                                style={{
                                                    left: `${magnifier.geometry.left * 100}%`,
                                                    top: `${magnifier.geometry.top * 100}%`,
                                                    width: `${magnifier.geometry.width * 100}%`,
                                                    height: `${magnifier.geometry.height * 100}%`,
                                                }}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                    </div>
                </div>
                <div className={styles.loadStatus} role="status">
                    {isLoading ? 'LOADING…' : loadError ? (
                        <>Couldn’t load more. <button type="button" onClick={onLoadMore}>RETRY</button></>
                    ) : null}
                </div>
                <div className={styles.canvasControls} role="group" aria-label="Canvas zoom">
                    <button type="button" onClick={zoomOut} aria-label="Zoom out">−</button>
                    <button type="button" onClick={zoomIn} aria-label="Zoom in">+</button>
                </div>
                <aside className={styles.sidebar} ref={sidebarRef}>
                    {magnifier?.item.image ? (
                        <div
                            className={styles.zoomPreview}
                            style={{
                                backgroundImage: `url(${imageUrl(magnifier.item.image)})`,
                                backgroundSize: `${magnifier.geometry.backgroundSize}% auto`,
                                backgroundPosition: `${magnifier.geometry.backgroundX}% ${magnifier.geometry.backgroundY}%`,
                            }}
                        />
                    ) : (
                        <div className={styles.sidebarPrompt}>
                            Hover on an image to view details
                        </div>
                    )}
                </aside>
            </div>
        </SectionFooterScroll>
    )
}
