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
import {useWorkProjectRouteSelection} from '../../controllers/WorkProjectRouteSelection'
import {useWorkSectionSession} from '../../hooks/useWorkSectionSession'
import {getWorkRouteSelectionView} from '@/features/work/lib/workRouteSelection'
import {PROJECTS_PAGE_SIZE} from '@/features/work/lib/constants'

type SidebarFilters = SidebarFiltersQueryResult

interface WorkSectionProps {
    initialProjects: Project[] | null
    initialFilter: Filter
    sidebarFilters: SidebarFilters | null
    activeWorkRoute?: string
    isProjectsLoading?: boolean
}

export function WorkSection({
    initialProjects,
    initialFilter,
    sidebarFilters,
    activeWorkRoute,
    isProjectsLoading = false,
}: WorkSectionProps) {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const hasMouseMoved = useMouseMoved()
    const {routeProject, routeProjectNotFound, clearRouteProjectSelection} =
        useWorkProjectRouteSelection()
    const activeSidebarFilters = sidebarFilters
    const routeSelectionView = getWorkRouteSelectionView({
        pathname,
        searchParams,
        lastWorkRoute: activeWorkRoute ?? pathname,
        projectRouteSelection: {
            project: routeProject,
            notFound: routeProjectNotFound,
        },
    })
    const {activeProject, isProjectDetail, routeProjectNotFound: isRouteProjectNotFound} =
        routeSelectionView
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
        if (isProjectDetail || (!routeProject && !routeProjectNotFound)) return

        clearRouteProjectSelection(routeSelectionView)
    }, [
        clearRouteProjectSelection,
        isProjectDetail,
        routeProject,
        routeProjectNotFound,
        routeSelectionView,
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
                        <div className={styles.projectLoading}>
                            {isProjectDetail ? '[LOADING PROJECT...]' : null}
                        </div>
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
