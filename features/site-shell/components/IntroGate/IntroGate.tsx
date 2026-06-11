'use client'

import {useState} from 'react'
import styles from './IntroGate.module.css'

export default function IntroGate({
    children,
}: {
    children: React.ReactNode
}) {
    const [showIntro, setShowIntro] = useState(true)

    return (
        <>
            {children}
            {showIntro && (
                <div
                    className={styles.intro}
                    aria-hidden="true"
                    onAnimationEnd={() => setShowIntro(false)}
                >
                    <img className={styles.logo} src="/final_logo.svg" alt="" />
                </div>
            )}
        </>
    )
}
