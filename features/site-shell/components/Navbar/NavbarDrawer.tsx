import {useEffect, useRef, type ReactNode} from 'react'
import styles from './Navbar.module.css'

interface NavbarDrawerProps {
    id: string
    label: string
    isOpen: boolean
    onClose: () => void
    children: ReactNode
    direction?: 'left' | 'right'
}

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex^="-"])',
].join(', ')

function getFocusableElements(container: HTMLElement) {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) => !element.hasAttribute('disabled'),
    )
}

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

    useEffect(() => {
        if (!isOpen) return

        previouslyFocusedElementRef.current =
            document.activeElement instanceof HTMLElement ? document.activeElement : null
        const drawerElement = drawerRef.current

        if (!drawerElement) return

        const focusableElements = getFocusableElements(drawerElement)

        focusableElements[0]?.focus({preventScroll: true}) ??
            drawerElement.focus({preventScroll: true})

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
                return
            }

            if (e.key !== 'Tab') return

            const currentFocusableElements = getFocusableElements(drawerElement)

            if (currentFocusableElements.length === 0) {
                e.preventDefault()
                drawerElement.focus({preventScroll: true})
                return
            }

            const firstElement = currentFocusableElements[0]
            const lastElement = currentFocusableElements[currentFocusableElements.length - 1]
            const activeElement = document.activeElement

            if (e.shiftKey) {
                if (activeElement === firstElement || activeElement === drawerElement) {
                    e.preventDefault()
                    lastElement.focus({preventScroll: true})
                }

                return
            }

            if (activeElement === lastElement) {
                e.preventDefault()
                firstElement.focus({preventScroll: true})
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            previouslyFocusedElementRef.current?.focus({preventScroll: true})
        }
    }, [onClose, isOpen])

    useEffect(() => {
        if (!isOpen) return

        const handlePointerDown = (e: PointerEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                onClose()
            }
        }

        document.addEventListener('pointerdown', handlePointerDown)

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            id={id}
            ref={drawerRef}
            aria-label={label}
            role="group"
            tabIndex={-1}
            className={styles.drawer}
            data-direction={direction}
        >
            <div className={styles.drawerInner}>{children}</div>
        </div>
    )
}
