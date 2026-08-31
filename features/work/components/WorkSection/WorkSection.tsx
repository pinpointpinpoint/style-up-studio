'use client'

import {lazy, Suspense, useEffect, useRef} from 'react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {WorkSidebar} from '../WorkSidebar/WorkSidebar'
import {Filter, Project} from '@/types'
import type {SidebarFiltersQueryResult} from '@/sanity.types'
import styles from './WorkSection.module.css'
import ProjectGallery from '../ProjectGallery/ProjectGallery'
import {useWorkSectionSession} from '../../hooks/useWorkSectionSession'
import {useProjectGalleryScrollRestoration} from '../../hooks/useProjectGalleryScrollRestoration'
import {useSiteRouteSelection} from '@/features/site-shell/routing/SiteRouteSelectionProvider'
import {PROJECTS_PAGE_SIZE} from '@/features/work/lib/constants'
import DelayedLoadingMessage from '@/shared/components/DelayedLoadingMessage/DelayedLoadingMessage'
import SectionFooterScroll from '@/features/site-shell/components/SectionFooterScroll/SectionFooterScroll'

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
    const workScrollRef = useRef<HTMLDivElement | null>(null)
    const pathname = usePathname()
    const router = useRouter()
    const searchParams = useSearchParams()
    useProjectGalleryScrollRestoration(workScrollRef)
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
            <SectionFooterScroll ref={workScrollRef}>
                {!isProjectDetail ? (
                    <div className={styles.workMain}>
                        <div className={styles.contentPane}>
                            <ProjectGallery
                                projects={visibleProjects}
                                hasMore={hasMore}
                                isLoading={isLoading}
                                onLoadMore={loadMore}
                                getProjectHref={getProjectHref}
                                onProjectOpen={handleProjectOpen}
                                onProjectHover={setHoveredProject}
                                onProjectLeave={() => setHoveredProject(null)}
                            />
                        </div>
                        <div className={styles.sidebarPane}>
                            <WorkSidebar
                                displayedProject={displayedProject}
                                sidebarFilters={activeSidebarFilters}
                                filter={filter}
                            />
                        </div>
                    </div>
                ) : (
                    <div className={styles.detailMain}>
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
                                <DeferredProjectDetailView
                                    project={activeProject}
                                    scrollContainerRef={workScrollRef}
                                />
                            </Suspense>
                        ) : isRouteProjectNotFound ? (
                            <div className={styles.projectLoading}>[PROJECT NOT FOUND]</div>
                        ) : (
                            <div className={styles.projectLoading} aria-hidden="true" />
                        )}
                    </div>
                )}
            </SectionFooterScroll>
        </div>
    )
}
