'use client'

import {useEffect, useState} from 'react'

const SCROLL_THRESHOLD = 8
const TOP_REVEAL_DISTANCE = 44

export function useNavbarScrollVisibility() {
    const [isHidden, setIsHidden] = useState(false)

    useEffect(() => {
        const mobile = window.matchMedia('(max-width: 768px)')
        let positions = new WeakMap<HTMLElement, {top: number; height: number; travel: number}>()
        const onBreakpointChange = () => {
            positions = new WeakMap()
            setIsHidden(false)
        }

        const onScroll = (event: Event) => {
            if (!mobile.matches) return
            const element = event.target
            if (!(element instanceof HTMLElement) || !element.hasAttribute('data-section-scroll')) return
            if (element.closest('[inert]')) return

            const height = element.clientHeight
            const top = Math.max(0, Math.min(element.scrollTop, element.scrollHeight - height))
            const previous = positions.get(element) ?? {top: 0, height, travel: 0}
            const delta = top - previous.top
            let travel = Math.sign(delta) === Math.sign(previous.travel) ? previous.travel + delta : delta

            // Expanding the panel as the navbar hides can adjust scrollTop.
            // Treat that as a layout change, not a change in scroll direction.
            if (height !== previous.height) {
                positions.set(element, {top, height, travel: 0})
                return
            }

            if (top <= TOP_REVEAL_DISTANCE) {
                setIsHidden(false)
                travel = 0
            } else if (Math.abs(travel) >= SCROLL_THRESHOLD) {
                setIsHidden(travel > 0)
                travel = 0
            }

            positions.set(element, {top, height, travel})
        }

        document.addEventListener('scroll', onScroll, {capture: true, passive: true})
        mobile.addEventListener('change', onBreakpointChange)
        return () => {
            document.removeEventListener('scroll', onScroll, true)
            mobile.removeEventListener('change', onBreakpointChange)
        }
    }, [])

    return {isHidden, showNavbar: () => setIsHidden(false)}
}
