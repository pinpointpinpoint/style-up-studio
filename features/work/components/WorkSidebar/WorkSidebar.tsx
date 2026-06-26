'use client'

import {useEffect, useRef, useState} from 'react'
import {Project} from '@/types'
import type {SidebarFiltersQueryResult} from '@/sanity.types'
import WorkIndexMenu from './WorkIndexMenu'
import ProjectInfoPanel from './ProjectInfoPanel'
import {Filter} from '@/types'
import styles from './WorkSidebar.module.css'

type WorkSidebarProps = {
    displayedProject: Project | null
    sidebarFilters: SidebarFiltersQueryResult | null
    filter: Filter
}

export function WorkSidebar({displayedProject, sidebarFilters, filter}: WorkSidebarProps) {
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
        <aside className={styles.container}>
            <div ref={filterSectionRef} className={styles.filterSection}>
                <WorkIndexMenu sidebarFilters={sidebarFilters} filter={filter} />
            </div>
            <div
                className={`${styles.detailsSection} ${hasFilterOverflow ? styles.detailsSectionOverflow : ''}`}
            >
                <ProjectInfoPanel displayedProject={displayedProject} />
            </div>
        </aside>
    )
}
