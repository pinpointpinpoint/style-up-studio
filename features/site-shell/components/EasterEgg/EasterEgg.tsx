'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import styles from './EasterEgg.module.css'

type Position = {
    x: number
    y: number
}

const MIN_DELAY_MS = 9000
const MAX_DELAY_MS = 26000
const VISIBLE_DURATION_MS = 7000

const MESSAGES = [
    'A SMALL STYLE DISTURBANCE HAS BEEN DETECTED.',
    'THIS BUTTON WAS NOT ON THE CALL SHEET.',
    'YOU FOUND THE LOOSE THREAD.',
    'CONGRATULATIONS. NOTHING IS NOW SLIGHTLY DIFFERENT.',
]

function getRandomBetween(min: number, max: number) {
    return min + Math.random() * (max - min)
}

function getRandomPosition(): Position {
    const margin = 72
    const width = typeof window === 'undefined' ? 1024 : window.innerWidth
    const height = typeof window === 'undefined' ? 768 : window.innerHeight

    return {
        x: getRandomBetween(margin, Math.max(margin, width - margin)),
        y: getRandomBetween(margin, Math.max(margin, height - margin)),
    }
}

function getRandomDelay() {
    return getRandomBetween(MIN_DELAY_MS, MAX_DELAY_MS)
}

function getRandomMessage() {
    return MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
}

export default function EasterEgg() {
    const [isButtonVisible, setIsButtonVisible] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [position, setPosition] = useState<Position>({x: 120, y: 120})
    const [message, setMessage] = useState(MESSAGES[0])
    const showTimerRef = useRef<number | null>(null)
    const hideTimerRef = useRef<number | null>(null)
    const scheduleButtonRef = useRef<() => void>(() => {})

    const clearTimers = useCallback(() => {
        if (showTimerRef.current) window.clearTimeout(showTimerRef.current)
        if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    }, [])

    const scheduleButton = useCallback(() => {
        scheduleButtonRef.current()
    }, [])

    useEffect(() => {
        scheduleButtonRef.current = () => {
            showTimerRef.current = window.setTimeout(() => {
                setPosition(getRandomPosition())
                setMessage(getRandomMessage())
                setIsButtonVisible(true)

                hideTimerRef.current = window.setTimeout(() => {
                    setIsButtonVisible(false)
                    scheduleButtonRef.current()
                }, VISIBLE_DURATION_MS)
            }, getRandomDelay())
        }
    }, [])

    useEffect(() => {
        scheduleButton()

        return clearTimers
    }, [clearTimers, scheduleButton])

    const handleOpen = () => {
        if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
        setIsButtonVisible(false)
        setIsModalOpen(true)
    }

    const handleClose = () => {
        setIsModalOpen(false)
        scheduleButton()
    }

    return (
        <>
            {isButtonVisible && !isModalOpen && (
                <div className={styles.triggerWrap} style={{left: position.x, top: position.y}}>
                    <button
                        type="button"
                        className={styles.trigger}
                        onClick={handleOpen}
                        aria-label="Open hidden message"
                    >
                        [?]
                    </button>
                </div>
            )}
            {isModalOpen && (
                <div className={styles.backdrop} role="presentation">
                    <div
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="easter-egg-title"
                    >
                        <div className={styles.header}>
                            <h2 id="easter-egg-title">FOUND OBJECT</h2>
                            <button type="button" onClick={handleClose}>
                                [CLOSE]
                            </button>
                        </div>
                        <p>{message}</p>
                    </div>
                </div>
            )}
        </>
    )
}
