'use client'

import {useEffect} from 'react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {WorkSidebar} from '../WorkSidebar/WorkSidebar'
import {Filter, Project} from '@/types'
import type {SidebarFiltersQueryResult} from '@/sanity.types'
import '@vidstack/react/player/styles/base.css'
import styles from './WorkSection.module.css'
import ProjectGallery from '../ProjectGallery/ProjectGallery'
import ProjectDetailView from '../ProjectDetailView/ProjectDetailView'
import {useMouseMoved} from '@/features/work/hooks/useMouseInitiatedHover'
import {useWorkSectionSession} from '../../hooks/useWorkSectionSession'
import {useSiteRouteSelection} from '@/features/site-shell/routing/SiteRouteSelectionProvider'
import {PROJECTS_PAGE_SIZE} from '@/features/work/lib/constants'

type SidebarFilters = SidebarFiltersQueryResult

interface WorkSectionProps {
    initialProjects: Project[] | null
    initialFilter: Filter
    sidebarFilters: SidebarFilters | null
    isProjectsLoading?: boolean
}

export function WorkSection({
    initialProjects,
    initialFilter,
    sidebarFilters,
    isProjectsLoading = false,
}: WorkSectionProps) {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const hasMouseMoved = useMouseMoved()
    const {
        activeProject,
        hasRouteProjectSelection,
        isProjectDetail,
        routeProjectNotFound: isRouteProjectNotFound,
        clearRouteProjectSelection,
    } = useSiteRouteSelection()
    const activeSidebarFilters = sidebarFilters
    const {
        visibleProjects,
        hasMore,
        isLoading,
        hoveredProject,
        filter,
        setFilter,
        loadMore,
        getProjectHref,
        handleProjectOpen,
        handleProjectDetailClose,
        setHoveredProject,
    } = useWorkSectionSession({
        initialProjects,
        initialFilter,
        sidebarFilters: activeSidebarFilters,
        isProjectsLoading,
        pathname,
        searchParams,
        router,
        pageSize: PROJECTS_PAGE_SIZE,
    })

    const displayedProject = hoveredProject ?? activeProject

    useEffect(() => {
        if (isProjectDetail || !hasRouteProjectSelection) return

        clearRouteProjectSelection()
    }, [
        clearRouteProjectSelection,
        hasRouteProjectSelection,
        isProjectDetail,
    ])

    return (
        <div className={styles.workSection}>
            <div className={styles.contentPane}>
                <div
                    className={`${styles.contentLayer} ${isProjectDetail ? styles.contentLayerHidden : styles.contentLayerActive}`}
                    aria-hidden={isProjectDetail}
                    inert={isProjectDetail ? true : undefined}
                >
                    <ProjectGallery
                        projects={visibleProjects}
                        hasMore={hasMore}
                        isLoading={isLoading}
                        onLoadMore={loadMore}
                        getProjectHref={getProjectHref}
                        onProjectOpen={handleProjectOpen}
                        onProjectHover={setHoveredProject}
                        onProjectLeave={() => setHoveredProject(null)}
                        hasMouseMoved={hasMouseMoved}
                    />
                </div>
                <div
                    className={`${styles.contentLayer} ${isProjectDetail ? styles.contentLayerActive : styles.contentLayerHidden}`}
                    aria-hidden={!isProjectDetail}
                    inert={!isProjectDetail ? true : undefined}
                >
                    {activeProject ? (
                        <ProjectDetailView
                            project={activeProject}
                            onClose={handleProjectDetailClose}
                        />
                    ) : isRouteProjectNotFound ? (
                        <div className={styles.projectLoading}>[PROJECT NOT FOUND]</div>
                    ) : (
                        <div className={styles.projectLoading} aria-hidden="true" />
                    )}
                </div>
            </div>
            {!isProjectDetail && (
                <WorkSidebar
                    displayedProject={displayedProject}
                    sidebarFilters={activeSidebarFilters}
                    filter={filter}
                    setFilter={setFilter}
                />
            )}
        </div>
    )
}
