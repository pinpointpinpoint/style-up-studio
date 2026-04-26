'use client';

import { Dispatch, FC, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Sidebar } from '../Sidebar/Sidebar'
import { Filter, Project } from '@/types'
import type { SidebarFiltersQueryResult } from '@/sanity.types'
import '@vidstack/react/player/styles/base.css'
import styles from'./WorkSection.module.css'
import ProjectGallery from '../ProjectGallery/ProjectGallery'
import ProjectDetailView from '../ProjectDetailView/ProjectDetailView'
import { useMouseMoved } from '@/hooks/useMouseInitiatedHover'
import { getProjects } from '@/app/(site)/actions'
import { useProjectRoute } from './ProjectRouteContext'
import {
  getProjectCursor,
  parseProjectFilter,
  writeProjectFilterToParams,
} from '@/lib/projectFilters'

const PROJECTS_PAGE_SIZE = 15
const PROJECT_GALLERY_RETURN_URL_KEY = 'projectGalleryReturnUrl'
type SidebarFilters = SidebarFiltersQueryResult

interface WorkSectionProps {
  initialProjects: Project[] | null
  initialFilter: Filter
  sidebarFilters: SidebarFilters | null
  activeWorkRoute?: string
  isProjectsLoading?: boolean
}

function getFilterKey(filter: Filter) {
  return JSON.stringify(filter)
}

function getProjectSlugFromPathname(pathname: string) {
  const match = pathname.match(/^\/work\/([^/?#]+)/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

function isWorkGalleryPathname(pathname: string) {
  return pathname === '/'
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

  const [visibleProjects, setVisibleProjects] = useState<Project[]>(initialProjects ?? [])
  const [hasMore, setHasMore] = useState((initialProjects?.length ?? 0) >= PROJECTS_PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(isProjectsLoading)
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null)
  const [filter, setFilter] = useState<Filter>(initialFilter)
  const { routeProject, routeProjectNotFound, setRouteProject } = useProjectRoute()
  const activeSidebarFilters = sidebarFilters
  const hasSkippedInitialFetchRef = useRef(false)
  const visibleWorkRoute = activeWorkRoute ?? pathname
  const selectedProjectSlug = getProjectSlugFromPathname(visibleWorkRoute)
  const activeProject = routeProject
  const isProjectDetail = Boolean(selectedProjectSlug)

  const displayedProject = hoveredProject ?? activeProject

  useEffect(() => {
    if (!isWorkGalleryPathname(pathname)) return

    const nextFilter = parseProjectFilter(searchParams, activeSidebarFilters)
    const nextFilterKey = getFilterKey(nextFilter)

    setFilter((currentFilter) => (
      getFilterKey(currentFilter) === nextFilterKey ? currentFilter : nextFilter
    ))
  }, [pathname, searchParams, activeSidebarFilters])

  useEffect(() => {
    if (isProjectDetail || !routeProject) return

    setRouteProject(null)
  }, [isProjectDetail, routeProject, setRouteProject])

  useEffect(() => {
    if (!hasSkippedInitialFetchRef.current) {
      hasSkippedInitialFetchRef.current = true
      return
    }

    let isCurrent = true

    async function refreshProjects() {
      setIsLoading(true)

      try {
        const nextProjects = await getProjects({
          filter,
          cursor: null,
          limit: PROJECTS_PAGE_SIZE,
        })

        if (!isCurrent) return

        setVisibleProjects(nextProjects)
        setHasMore(nextProjects.length >= PROJECTS_PAGE_SIZE)
        setHoveredProject(null)
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    refreshProjects()

    return () => {
      isCurrent = false
    }
  }, [filter])

  const handleFilterChange: Dispatch<SetStateAction<Filter>> = useCallback((value) => {
    const nextFilter = typeof value === 'function' ? value(filter) : value
    const nextParams = writeProjectFilterToParams(nextFilter, activeSidebarFilters, searchParams)
    const queryString = nextParams.toString()

    setFilter(nextFilter)
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }, [activeSidebarFilters, filter, pathname, router, searchParams])

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    const cursor = getProjectCursor(visibleProjects[visibleProjects.length - 1], filter)

    setIsLoading(true)

    try {
      const nextProjects = await getProjects({
        filter,
        cursor,
        limit: PROJECTS_PAGE_SIZE,
      })

      setVisibleProjects((currentProjects) => [...currentProjects, ...nextProjects])
      setHasMore(nextProjects.length >= PROJECTS_PAGE_SIZE)
    } finally {
      setIsLoading(false)
    }
  }, [filter, hasMore, isLoading, visibleProjects])

  const getProjectHref = useCallback((project: Project) => {
    return project.slug ? `/work/${project.slug}` : '/'
  }, [])

  const handleProjectOpen = useCallback(() => {
    const queryString = searchParams.toString()
    const returnUrl = queryString ? `${pathname}?${queryString}` : pathname

    sessionStorage.setItem(PROJECT_GALLERY_RETURN_URL_KEY, returnUrl)
  }, [pathname, searchParams])

  const handleProjectDetailClose = useCallback(() => {
    const savedReturnUrl = sessionStorage.getItem(PROJECT_GALLERY_RETURN_URL_KEY)

    if (savedReturnUrl) {
      sessionStorage.removeItem(PROJECT_GALLERY_RETURN_URL_KEY)
      router.push(savedReturnUrl)
      return
    }

    let shouldGoBack = false

    try {
      const referrer = document.referrer ? new URL(document.referrer) : null
      shouldGoBack = Boolean(
        referrer &&
        referrer.origin === window.location.origin &&
        window.history.length > 1
      )
    } catch {
      shouldGoBack = false
    }

    if (shouldGoBack) {
      router.back()
      return
    }

    router.push('/')
  }, [router])

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
            onLoadMore={handleLoadMore}
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
            <div className={styles.projectLoading}>
              [PROJECT NOT FOUND]
            </div>
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
          setFilter={handleFilterChange}
        />
      )}
    </div>
  )
}
