'use client'

import {useEffect, useRef, useState} from 'react'
import type {SidebarFiltersQueryResult} from '@/sanity.types'
import WorkIndexMenu from '../WorkSidebar/WorkIndexMenu'
import {Filter} from '@/types'
import styles from './MobileMenu.module.css'
 
type MobileMenuProps = {
    sidebarFilters: SidebarFiltersQueryResult | null
    filter: Filter
}

export function MobileMenu({sidebarFilters, filter}: MobileMenuProps) {
    const filterSectionRef = useRef<HTMLDivElement | null>(null)
    const [hasFilterOverflow, setHasFilterOverflow] = useState(false)

    useEffect(() => {
        const filterSection = filterSectionRef.current

        if (!filterSection) return

        let animationFrameId = 0

        const updateOverflowState = () => {
            window.cancelAnimationFrame(animationFrameId)

            animationFrameId = window.requestAnimationFrame(() => {
                const scrollAreas = Array.from(
                    filterSection.querySelectorAll<HTMLElement>('[data-sidebar-scroll-area]'),
                )
                const hasOverflow = scrollAreas.some(
                    (area) => area.scrollHeight > area.clientHeight + 1,
                )

                setHasFilterOverflow(hasOverflow)
            })
        }

        const resizeObserver = new ResizeObserver(updateOverflowState)
        const mutationObserver = new MutationObserver(updateOverflowState)

        resizeObserver.observe(filterSection)
        filterSection
            .querySelectorAll<HTMLElement>('[data-sidebar-scroll-area]')
            .forEach((area) => resizeObserver.observe(area))
        mutationObserver.observe(filterSection, {
            attributes: true,
            childList: true,
            subtree: true,
        })
        window.addEventListener('resize', updateOverflowState)
        updateOverflowState()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
            resizeObserver.disconnect()
            mutationObserver.disconnect()
            window.removeEventListener('resize', updateOverflowState)
        }
    }, [sidebarFilters, filter])

    return (
        <details className={styles.details}>
            <summary className={styles.summary}>[INDEX]</summary>
            <WorkIndexMenu sidebarFilters={sidebarFilters} filter={filter} variant="mobile" />
        </details>
    )
}