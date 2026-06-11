'use client'

import {lazy, Suspense, useEffect} from 'react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {WorkSidebar} from '../WorkSidebar/WorkSidebar'
import {Filter, Project} from '@/types'
import type {SidebarFiltersQueryResult} from '@/sanity.types'
import styles from './WorkSection.module.css'
import ProjectGallery from '../ProjectGallery/ProjectGallery'
import {useMouseMoved} from '@/features/work/hooks/useMouseInitiatedHover'
import {useWorkSectionSession} from '../../hooks/useWorkSectionSession'
import {useSiteRouteSelection} from '@/features/site-shell/routing/SiteRouteSelectionProvider'
import {PROJECTS_PAGE_SIZE} from '@/features/work/lib/constants'
import DelayedLoadingMessage from '@/shared/components/DelayedLoadingMessage/DelayedLoadingMessage'

const loadProjectDetailView = () => import('../ProjectDetailView/ProjectDetailView')
const DeferredProjectDetailView = lazy(loadProjectDetailView)

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
        setProjectDetailCloseAction,
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
    }, [clearRouteProjectSelection, hasRouteProjectSelection, isProjectDetail])

    useEffect(() => {
        if (!isProjectDetail) return

        setProjectDetailCloseAction(handleProjectDetailClose)

        return () => {
            setProjectDetailCloseAction(null)
        }
    }, [handleProjectDetailClose, isProjectDetail, setProjectDetailCloseAction])

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
                        onProjectIntent={() => {
                            void loadProjectDetailView()
                        }}
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
                        <Suspense
                            fallback={
                                <section
                                    className={styles.projectDetailLoading}
                                    aria-label={`${activeProject.title ?? 'Project'} details`}
                                >
                                    <div className={styles.projectDetailLoadingMedia}>
                                        <DelayedLoadingMessage />
                                    </div>
                                    <aside className={styles.projectDetailLoadingSidebar} />
                                </section>
                            }
                        >
                            <DeferredProjectDetailView project={activeProject} />
                        </Suspense>
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
