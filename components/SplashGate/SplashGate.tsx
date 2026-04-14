'use client'

import { useEffect, useState } from 'react'
import styles from './SplashGate.module.css'
import { IntroContext } from '@/contexts/IntroContext'

export default function SplashGate({
  children,
}: {
  children: React.ReactNode
}) {
  const [ready, setReady] = useState(false)
  const [showSplash, setShowSplash] = useState(false)
  const [visible, setVisible] = useState(true)
  const [introDone, setIntroDone] = useState(false)

  useEffect(() => {
    let holdTimer: ReturnType<typeof setTimeout> | undefined
    let removeTimer: ReturnType<typeof setTimeout> | undefined

    const visited = sessionStorage.getItem('visited')

    if (visited) {
      setIntroDone(true)
      setShowSplash(false)
      setVisible(false)
    } else {
      sessionStorage.setItem('visited', 'true')

      setShowSplash(true)
      setVisible(true)

      holdTimer = setTimeout(() => {
        setVisible(false)
      }, 1200)

      removeTimer = setTimeout(() => {
        setShowSplash(false)
        setIntroDone(true)
      }, 1400)
    }

    setReady(true)

    return () => {
      if (holdTimer) clearTimeout(holdTimer)
      if (removeTimer) clearTimeout(removeTimer)
    }
  }, [])

  if (!ready) return null

  return (
    <IntroContext.Provider value={introDone}>
      {children}

      {showSplash && (
        <div
          className={`${styles.loader} ${
            visible ? styles.loaderVisible : styles.loaderHidden
          }`}
        >
          <img src="/loader.gif" alt="Loading..." />
        </div>
      )}
    </IntroContext.Provider>
  )
}