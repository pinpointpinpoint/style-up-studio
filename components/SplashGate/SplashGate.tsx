'use client'

import { useEffect, useState } from 'react'
import styles from './SplashGate.module.css'
import { IntroContext } from '@/contexts/IntroContext'

export default function SplashGate({
  children,
}: {
  children: React.ReactNode
}) {
  const [showSplash, setShowSplash] = useState(true)
  const [visible, setVisible] = useState(true)
  const [introDone, setIntroDone] = useState(false)

  useEffect(() => {
    const holdTimer = setTimeout(() => {
      setVisible(false)
    }, 1200)

    const removeTimer = setTimeout(() => {
      setShowSplash(false)
      setIntroDone(true)
    }, 1400)

    return () => {
      clearTimeout(holdTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  return (
    <IntroContext.Provider value={introDone}>
      {children}

      {showSplash && (
        <div
          className={`${styles.loader} ${
            visible ? styles.loaderVisible : styles.loaderHidden
          }`}
        >
          <video src="/loader.mp4" autoPlay muted playsInline className={styles.video} />
        </div>
      )}
    </IntroContext.Provider>
  )
}
