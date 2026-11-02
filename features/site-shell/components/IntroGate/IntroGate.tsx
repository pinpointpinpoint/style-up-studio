'use client'

import {Suspense, useEffect, useRef, useState, type ReactNode, type RefObject} from 'react'
import {waitForPageMedia} from './waitForPageMedia'
import styles from './IntroGate.module.css'

const MINIMUM_INTRO_MS = 2500
const FLASH_INTERVAL_MS = 400
const LAST_IMAGE_HOLD_MS = 400
const images = Array.from({length: 19}, (_, i) => `/loading/Cutout${i + 1}.png`)

function FlashImages({paused}: {paused: boolean}) {
    const [activeImage, setActiveImage] = useState<number | null>(null)

    useEffect(() => {
        const firstFrame = window.requestAnimationFrame(() => {
            setActiveImage(Math.floor(Math.random() * images.length))
        })
        return () => window.cancelAnimationFrame(firstFrame)
    }, [])

    useEffect(() => {
        if (paused) return

        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
        const timer = window.setInterval(() => {
            if (motionPreference.matches) return

            // Pick a different image each time, without immediate repeats.
            const offset = 1 + Math.floor(Math.random() * (images.length - 1))
            setActiveImage((current) => ((current ?? 0) + offset) % images.length)
        }, FLASH_INTERVAL_MS)

        return () => window.clearInterval(timer)
    }, [paused])

    return (
        <div className={styles.flashImages} aria-hidden="true">
            {images.map((image, i) => (
                <img
                    key={image}
                    className={styles.flashImage}
                    src={image}
                    alt=""
                    hidden={i !== activeImage}
                />
            ))}
        </div>
    )
}

// This effect runs once the surrounding Suspense boundary reveals its content.
function ContentReady({root, onReady}: {root: RefObject<HTMLDivElement | null>; onReady: (ready: boolean) => void}) {
    useEffect(() => {
        if (!root.current) return
        return waitForPageMedia(root.current, () => onReady(true))
    }, [root, onReady])
    return null
}

export default function IntroGate({children}: {children: ReactNode}) {
    const contentRef = useRef<HTMLDivElement>(null)
    const [minimumElapsed, setMinimumElapsed] = useState(false)
    const [contentReady, setContentReady] = useState(false)
    const [dismissed, setDismissed] = useState(false)
    const showIntro = !minimumElapsed || !contentReady

    useEffect(() => {
        const timer = window.setTimeout(() => setMinimumElapsed(true), MINIMUM_INTRO_MS)
        return () => window.clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (showIntro) return

        const timer = window.setTimeout(() => setDismissed(true), LAST_IMAGE_HOLD_MS)
        return () => window.clearTimeout(timer)
    }, [showIntro])

    return (
        <>
            <div ref={contentRef} inert={!dismissed} aria-hidden={!dismissed ? true : undefined}>
                <Suspense fallback={null}>
                    {children}
                    <ContentReady root={contentRef} onReady={setContentReady} />
                </Suspense>
            </div>
            {!dismissed && (
                <div
                    className={styles.introGate}
                    role="status"
                    aria-label="Loading Style Up Studio"
                >
                    <FlashImages paused={!showIntro} />
                </div>
            )}
        </>
    )
}
