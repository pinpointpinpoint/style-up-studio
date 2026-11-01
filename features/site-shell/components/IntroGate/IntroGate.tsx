
'use client'

import { useEffect, useState } from 'react'
import styles from './IntroGate.module.css'

const images = Array.from(
    { length: 6 },
    (_, i) => `/loading/Cutout${i+1}.png`
)

export default function IntroGate() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 4000)
        return () => clearTimeout(timer)
    }, [])

    return (
        isLoading &&
        <div className={styles.introGate}>
            <div className={styles.flashGrid}>
                {images.map((image, i) => (
                    <div
                        key={image}
                        className={styles.gridItem}
                        style={{
                            backgroundImage: `url('${image}')`,
                            animationDelay: `${((i * 7) % 20) * 0.2}s`
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
