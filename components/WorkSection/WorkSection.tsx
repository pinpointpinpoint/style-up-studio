'use client'

import {FC, useEffect} from 'react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {Sidebar} from '../Sidebar/Sidebar'
import {Filter, Project} from '@/types'
import type {SidebarFiltersQueryResult} from '@/sanity.types'
import '@vidstack/react/player/styles/base.css'
import styles from './WorkSection.module.css'
import ProjectGallery from '../ProjectGallery/ProjectGallery'
import ProjectDetailView from '../ProjectDetailView/ProjectDetailView'
import {useMouseMoved} from '@/hooks/useMouseInitiatedHover'
import {useProjectRoute} from './ProjectRouteContext'
import {useWorkBrowsingSession} from './useWorkBrowsingSession'
import {getRouteProjectView, getWorkRouteSection} from '@/lib/workRouteSelection'
import {PROJECTS_PAGE_SIZE} from '@/lib/workBrowsingConfig'

type SidebarFilters = SidebarFiltersQueryResult

interface WorkSectionProps {
    initialProjects: Project[] | null
    initialFilter: Filter
    sidebarFilters: SidebarFilters | null
    activeWorkRoute?: string
    isProjectsLoading?: boolean
}

export const WorkSection: FC<WorkSectionProps> = ({
    initialProjects,
    initialFilter,
    sidebarFilters,
    activeWorkRoute,
    isProjectsLoading = false,
}) => {
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    const hasMouseMoved = useMouseMoved()
    const {routeProject, routeProjectNotFound, setRouteProject} = useProjectRoute()
    const activeSidebarFilters = sidebarFilters
    const visibleWorkRoute = activeWorkRoute ?? pathname
    const routeProjectViewRoute =
        getWorkRouteSection(pathname) === 'work' ? visibleWorkRoute : pathname
    const {activeProject, isProjectDetail} = getRouteProjectView(routeProjectViewRoute, {
        project: routeProject,
        notFound: routeProjectNotFound,
    })
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
    } = useWorkBrowsingSession({
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

        setRouteProject(null)
    }, [isProjectDetail, routeProject, routeProjectNotFound, setRouteProject])

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
                    ) : routeProjectNotFound ? (
                        <div className={styles.projectLoading}>[PROJECT NOT FOUND]</div>
                    ) : (
                        <div className={styles.projectLoading}>
                            {isProjectDetail ? '[LOADING PROJECT...]' : null}
                        </div>
                    )}
                </div>
            </div>
            {!isProjectDetail && (
                <Sidebar
                    displayedProject={displayedProject}
                    sidebarFilters={activeSidebarFilters}
                    filter={filter}
                    setFilter={setFilter}
                />
            )}
        </div>
    )
}
