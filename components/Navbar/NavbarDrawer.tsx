import { useEffect, useEffectEvent, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import styles from './Navbar.module.css'

interface NavbarDrawerProps {
  id: string
  label: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  direction?: 'left' | 'right'
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function NavbarDrawer({
  id,
  label,
  isOpen,
  onClose,
  children,
  direction = 'left',
}: NavbarDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const initialX = direction === 'right' ? '100%' : '-100%'
  const closedPosition = prefersReducedMotion ? { x: 0 } : { x: initialX }
  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'tween' as const, duration: 0.3 }
  const closeDrawer = useEffectEvent(() => {
    onClose()
  })

  useEffect(() => {
    if (!isOpen) return

    previouslyFocusedElementRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const drawerElement = drawerRef.current

    if (!drawerElement) return

    const focusableElements = Array.from(
      drawerElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((element) => !element.hasAttribute('disabled'))

    focusableElements[0]?.focus({ preventScroll: true }) ??
      drawerElement.focus({ preventScroll: true })

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer()
        return
      }

      if (e.key !== 'Tab') return

      const currentFocusableElements = Array.from(
        drawerElement.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute('disabled'))

      if (currentFocusableElements.length === 0) {
        e.preventDefault()
        drawerElement.focus({ preventScroll: true })
        return
      }

      const firstElement = currentFocusableElements[0]
      const lastElement = currentFocusableElements[currentFocusableElements.length - 1]
      const activeElement = document.activeElement

      if (e.shiftKey) {
        if (activeElement === firstElement || activeElement === drawerElement) {
          e.preventDefault()
          lastElement.focus({ preventScroll: true })
        }

        return
      }

      if (activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus({ preventScroll: true })
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedElementRef.current?.focus({ preventScroll: true })
    }
  }, [closeDrawer, isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeDrawer()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [closeDrawer, isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id={id}
          ref={drawerRef}
          role="dialog"
          aria-label={label}
          tabIndex={-1}
          initial={closedPosition}
          animate={{ x: 0 }}
          exit={closedPosition}
          transition={transition}
          className={styles.drawer}
        >
          <div className={styles.drawerInner}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}