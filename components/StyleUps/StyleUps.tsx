'use client';

import { urlFor } from "@/sanity/lib/utils";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";
import { type FC, type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import styles from "./StyleUps.module.css";

export type StyleUpItem = {
  _id: string
  name?: string | null
  image?: SanityImageSource | null
}

interface StyleUpsProps {
  styleUps: StyleUpItem[] | null;
}

type StyleUpLayout = {
  left: number
  top: number
  width: number
  x: number
  y: number
}

type DragState = {
  id: string
  startClientX: number
  startClientY: number
  startX: number
  startY: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function getCanvasHeight(count: number) {
  const rows = Math.max(2, Math.ceil(count / 3))

  return `max(calc(100% - 60px), ${Math.max(660, rows * 260)}px)`
}

function getRandomLayout(): StyleUpLayout {
  const width = 14 + Math.random() * 12
  const halfSize = width / 2
  const left = Math.random() * 100
  const top = Math.random() * 100

  return {
    left: clamp(left, halfSize, 100 - halfSize),
    top: clamp(top, halfSize, 100 - halfSize),
    width,
    x: 0,
    y: 0,
  }
}

export const StyleUps: FC<StyleUpsProps> = ({ styleUps }) => {
  const dragStateRef = useRef<DragState | null>(null);
  const nextZIndexRef = useRef(1);
  const [randomLayouts, setRandomLayouts] = useState<Record<string, StyleUpLayout>>({});
  const [layouts, setLayouts] = useState<Record<string, StyleUpLayout>>({});
  const [zIndexes, setZIndexes] = useState<Record<string, number>>({});

  useEffect(() => {
    const nextLayouts: Record<string, StyleUpLayout> = {}

    styleUps?.forEach((styleUp) => {
      nextLayouts[styleUp._id] = getRandomLayout()
    })

    nextZIndexRef.current = styleUps?.length ? styleUps.length + 1 : 1
    setLayouts({})
    setZIndexes({})
    setRandomLayouts(nextLayouts)
  }, [styleUps]);

  if (!styleUps || styleUps.length === 0) return null;

  const canvasHeight = getCanvasHeight(styleUps.length)
  const hasRandomLayouts = styleUps.every((styleUp) => randomLayouts[styleUp._id])
  const getLayout = (styleUp: StyleUpItem) => (
    layouts[styleUp._id] ??
    randomLayouts[styleUp._id]
  )

  const bringToFront = (id: string) => {
    setZIndexes((currentZIndexes) => ({
      ...currentZIndexes,
      [id]: nextZIndexRef.current,
    }))
    nextZIndexRef.current += 1
  }

  const handlePointerDown = (styleUp: StyleUpItem) => (event: ReactPointerEvent<HTMLDivElement>) => {
    const layout = getLayout(styleUp)

    if (!layout) return

    bringToFront(styleUp._id)
    event.currentTarget.setPointerCapture(event.pointerId)

    dragStateRef.current = {
      id: styleUp._id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: layout.x,
      startY: layout.y,
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current

    if (!dragState) return

    const deltaX = event.clientX - dragState.startClientX
    const deltaY = event.clientY - dragState.startClientY

    setLayouts((currentLayouts) => ({
      ...currentLayouts,
      [dragState.id]: {
        ...(currentLayouts[dragState.id] ?? randomLayouts[dragState.id]),
        x: dragState.startX + deltaX,
        y: dragState.startY + deltaY,
      },
    }))
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStateRef.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div className={styles.main}>
      <div className={styles.styleUps}>
        <div className={styles.canvas} style={{ minHeight: canvasHeight }}>
          {hasRandomLayouts && styleUps.map((su, index) => {
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
                  zIndex: zIndexes[su._id] ?? index + 1,
                  transform: `translate(${layout.x}px, ${layout.y}px) translate(-50%, -50%)`,
                }}
                onMouseEnter={() => bringToFront(su._id)}
                onPointerDown={handlePointerDown(su)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {su.image && (
                  <Image
                    src={urlFor(su.image).width(900).height(900).fit('crop').url()}
                    height={900}
                    width={900}
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
  );
};
