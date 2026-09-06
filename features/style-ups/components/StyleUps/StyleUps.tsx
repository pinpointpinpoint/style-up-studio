'use client'

import { urlFor } from '@/sanity/lib/utils'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
    bringStyleUpToFront,
    createStyleUpCanvasSession,
    endStyleUpDrag,
    getStyleUpCanvasHeight,
    getStyleUpLoadMoreLayout,
    moveStyleUpDrag,
    startStyleUpDrag,
} from '@/features/style-ups/lib/styleUpCanvasSession'
import SectionFooterScroll from '@/features/site-shell/components/SectionFooterScroll/SectionFooterScroll'
import styles from './StyleUps.module.css'

export type StyleUpItem = {
    _id: string
    name?: string | null
    image?: SanityImageSource | null
}

type StyleUpsProps = {
    styleUps: StyleUpItem[] | null
}

export function StyleUps({ styleUps }: StyleUpsProps) {
    const [magnifier, setMagnifier] = useState<{
        item: StyleUpItem
        left: number
        top: number
        width: number
        height: number
        cardWidth: number
        cardHeight: number
    } | null>(null)
    const sidebarRef = useRef<HTMLElement | null>(null)
    const [sidebarAspectRatio, setSidebarAspectRatio] = useState(1)
    const styleUpsRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLDivElement | null>(null)
    const [session, setSession] = useState(() => createStyleUpCanvasSession({ styleUps }))
    const sessionStyleUpIds = Object.keys(session.layouts)
    const hasCurrentSession =
        (styleUps?.length ?? 0) === sessionStyleUpIds.length &&
        (styleUps ?? []).every((styleUp) => session.layouts[styleUp._id])
    const fallbackSession = useMemo(() => createStyleUpCanvasSession({ styleUps }), [styleUps])
    const activeSession = hasCurrentSession ? session : fallbackSession

    if (!styleUps || styleUps.length === 0) return null

    const canvasHeight = getStyleUpCanvasHeight(styleUps.length)
    const hasRandomLayouts = styleUps.every((styleUp) => activeSession.layouts[styleUp._id])
    const loadMoreLayout = getStyleUpLoadMoreLayout(styleUps.length)
    const getLayout = (styleUp: StyleUpItem) => activeSession.layouts[styleUp._id]

    const bringToFront = (id: string) => {
        setSession((currentSession) =>
            bringStyleUpToFront(hasCurrentSession ? currentSession : fallbackSession, id),
        )
    }

    const LENS_WIDTH = 30

    const backgroundX = magnifier
        ? (magnifier.left / (magnifier.cardWidth - magnifier.width)) * 100
        : 0

    const backgroundY = magnifier
        ? (magnifier.top / (magnifier.cardHeight - magnifier.height)) * 100
        : 0

    const handlePointerDown =
        (styleUp: StyleUpItem) => (event: ReactPointerEvent<HTMLDivElement>) => {
            const layout = getLayout(styleUp)
            const styleUpsElement = styleUpsRef.current
            const canvasElement = canvasRef.current

            if (!layout || !styleUpsElement || !canvasElement) return

            const styleUpsRect = styleUpsElement.getBoundingClientRect()
            const canvasRect = canvasElement.getBoundingClientRect()
            const cardRect = event.currentTarget.getBoundingClientRect()

            setSession((currentSession) =>
                startStyleUpDrag(
                    bringStyleUpToFront(
                        hasCurrentSession ? currentSession : fallbackSession,
                        styleUp._id,
                    ),
                    {
                        id: styleUp._id,
                        clientX: event.clientX,
                        clientY: event.clientY,
                        bounds: {
                            canvasWidth: canvasRect.width,
                            canvasHeight: canvasRect.height,
                            cardWidth: cardRect.width,
                            cardHeight: cardRect.height,
                            boundaryLeft: styleUpsRect.left - canvasRect.left,
                            boundaryTop: styleUpsRect.top - canvasRect.top,
                            boundaryRight: styleUpsRect.right - canvasRect.left,
                            boundaryBottom: styleUpsRect.bottom - canvasRect.top,
                        },
                    },
                ),
            )
            event.currentTarget.setPointerCapture(event.pointerId)
        }

    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

    const handlePointerMove =
        (styleUp: StyleUpItem) => (event: ReactPointerEvent<HTMLDivElement>) => {
            setSession((currentSession) =>
                moveStyleUpDrag(currentSession, {
                    clientX: event.clientX,
                    clientY: event.clientY,
                }),
            )

            const rect = event.currentTarget.getBoundingClientRect()

            const lensWidth = rect.width * (LENS_WIDTH / 100)
            const lensHeight = lensWidth / sidebarAspectRatio

            const pointerX = event.clientX - rect.left
            const pointerY = event.clientY - rect.top

            const left = clamp(pointerX - lensWidth / 2, 0, rect.width - lensWidth)

            const top = clamp(pointerY - lensHeight / 2, 0, rect.height - lensHeight)

            setMagnifier({
                item: styleUp,
                left,
                top,
                width: lensWidth,
                height: lensHeight,
                cardWidth: rect.width,
                cardHeight: rect.height,
            })
        }

    const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
        setSession(endStyleUpDrag)

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
        }
    }

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

    return (
        <SectionFooterScroll>
            <div className={styles.main}>
                <div ref={styleUpsRef} className={styles.styleUps}>
                    <div
                        ref={canvasRef}
                        className={styles.canvas}
                        style={{ minHeight: canvasHeight }}
                    >
                        {hasRandomLayouts &&
                            styleUps.map((su, index) => {
                                const layout = getLayout(su)

                                if (!layout) return null

                                return (
                                    <div
                                        key={su._id}
                                        className={styles.card}
                                        style={{
                                            left: `${layout.left}%`,
                                            top: `${layout.top}%`,
                                            width: `${layout.width}%`,
                                            zIndex: activeSession.zIndexes[su._id] ?? index + 1,
                                            transform: `translate(${layout.x}px, ${layout.y}px) translate(-50%, -50%)`,
                                        }}
                                        onMouseEnter={() => bringToFront(su._id)}
                                        onPointerDown={handlePointerDown(su)}
                                        onPointerUp={handlePointerUp}
                                        onPointerCancel={handlePointerUp}
                                        onPointerMove={handlePointerMove(su)}
                                        onPointerLeave={() => setMagnifier(null)}
                                    >
                                        {su.image && (
                                            <img
                                                src={urlFor(su.image)
                                                    .width(900)
                                                    .height(900)
                                                    .fit('crop')
                                                    .url()}
                                                alt={`Style up image for ${su.name ?? 'style up'}`}
                                                draggable={false}
                                            />
                                        )}

                                        {magnifier?.item._id === su._id && (
                                            <div
                                                className={styles.magnifierLens}
                                                style={{
                                                    left: magnifier.left,
                                                    top: magnifier.top,
                                                    width: magnifier.width,
                                                    height: magnifier.height,
                                                }}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        <button
                            type="button"
                            className={styles.loadMoreCard}
                            style={{
                                left: `${loadMoreLayout.left}%`,
                                top: `${loadMoreLayout.top}%`,
                                width: `${loadMoreLayout.width}%`,
                                zIndex: activeSession.nextZIndex + 1,
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            LOAD MORE
                        </button>
                    </div>
                </div>
                <aside className={styles.sidebar} ref={sidebarRef}>
                    {magnifier?.item.image ? (
                        <div
                            className={styles.zoomPreview}
                            style={{
                                backgroundImage: `url(${urlFor(magnifier.item.image)
                                    .width(1600)
                                    .height(1600)
                                    .fit('crop')
                                    .url()})`,
                                backgroundSize: `${10000 / LENS_WIDTH}% auto`,
                                backgroundPosition: `${backgroundX}% ${backgroundY}%`,
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
