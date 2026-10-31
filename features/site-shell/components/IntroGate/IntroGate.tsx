
'use client'

import { useEffect, useState } from 'react'
import styles from './IntroGate.module.css'

const images = Array.from(
    { length: 20 },
    (_, i) => `/loading/img${i || ''}.svg`
)

export default function IntroGate() {
    // const [isLoading, setIsLoading] = useState(true)

    // useEffect(() => {
    //     const timer = setTimeout(() => setIsLoading(false), 4500)
    //     return () => clearTimeout(timer)
    // }, [])

    return (
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
