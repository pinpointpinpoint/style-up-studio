'use client';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Project } from '@/types';
import type { SidebarFiltersQueryResult } from '@/sanity.types'
import FilterMenu from './FilterMenu';
import ProjectDetails from './ProjectDetails';
import { Filter } from '@/types';
import styles from "./Sidebar.module.css";

type SidebarProps = {
    displayedProject: Project | null
    sidebarFilters: SidebarFiltersQueryResult | null
    filter: Filter
    setFilter: Dispatch<SetStateAction<Filter>>
}

export function Sidebar({
    displayedProject,
    sidebarFilters,
    filter,
    setFilter,
}: SidebarProps) {
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
            <div
                ref={filterSectionRef}
                className={styles.filterSection}
            >
                <FilterMenu
                    sidebarFilters={sidebarFilters}
                    filter={filter}
                    setFilter={setFilter}
                />
            </div>
            <div
                className={`${styles.detailsSection} ${hasFilterOverflow ? styles.detailsSectionOverflow : ''}`}
            >
                <ProjectDetails
                    displayedProject={displayedProject}
                />
            </div>
        </aside>
    )
}
