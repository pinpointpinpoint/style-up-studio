'use client'

import {urlFor} from '@/sanity/lib/utils'
import type {SanityImageSource} from '@sanity/image-url/lib/types/types'
import {type PointerEvent as ReactPointerEvent, useMemo, useRef, useState} from 'react'
import {
    bringStyleUpToFront,
    createStyleUpCanvasSession,
    endStyleUpDrag,
    getStyleUpCanvasHeight,
    moveStyleUpDrag,
    startStyleUpDrag,
} from '@/features/style-ups/lib/styleUpCanvasSession'
import styles from './StyleUps.module.css'

export type StyleUpItem = {
    _id: string
    name?: string | null
    image?: SanityImageSource | null
}

type StyleUpsProps = {
    styleUps: StyleUpItem[] | null
}

export function StyleUps({styleUps}: StyleUpsProps) {
    const styleUpsRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLDivElement | null>(null)
    const [session, setSession] = useState(() => createStyleUpCanvasSession({styleUps}))
    const sessionStyleUpIds = Object.keys(session.layouts)
    const hasCurrentSession =
        (styleUps?.length ?? 0) === sessionStyleUpIds.length &&
        (styleUps ?? []).every((styleUp) => session.layouts[styleUp._id])
    const fallbackSession = useMemo(() => createStyleUpCanvasSession({styleUps}), [styleUps])
    const activeSession = hasCurrentSession ? session : fallbackSession

    if (!styleUps || styleUps.length === 0) return null

    const canvasHeight = getStyleUpCanvasHeight(styleUps.length)
    const hasRandomLayouts = styleUps.every((styleUp) => activeSession.layouts[styleUp._id])
    const getLayout = (styleUp: StyleUpItem) => activeSession.layouts[styleUp._id]

    const bringToFront = (id: string) => {
        setSession((currentSession) =>
            bringStyleUpToFront(hasCurrentSession ? currentSession : fallbackSession, id),
        )
    }

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

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        setSession((currentSession) =>
            moveStyleUpDrag(currentSession, {
                clientX: event.clientX,
                clientY: event.clientY,
            }),
        )
    }

    const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
        setSession(endStyleUpDrag)

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
        }
    }

    return (
        <div className={styles.main}>
            <div ref={styleUpsRef} className={styles.styleUps}>
                <div ref={canvasRef} className={styles.canvas} style={{minHeight: canvasHeight}}>
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
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    onPointerCancel={handlePointerUp}
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
                                </div>
                            )
                        })}
                </div>
            </div>
            <aside className={styles.sidebar}>
                <div></div>
            </aside>
        </div>
    )
}
