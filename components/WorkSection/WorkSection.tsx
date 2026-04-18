'use client';

import { Dispatch, FC, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Sidebar } from '../Sidebar/Sidebar'
import VideoPlayer from '@/components/VideoPlayer/VideoPlayer'
import { Filter, Project } from '@/types'
import '@vidstack/react/player/styles/base.css'
import styles from'./WorkSection.module.css'
import ProjectGallery from '../ProjectGallery/ProjectGallery'
import { useMouseMoved } from '@/hooks/useMouseInitiatedHover'
import { getProjects } from '@/app/(site)/actions'
import {
  getProjectCursor,
  parseProjectFilter,
  writeProjectFilterToParams,
} from '@/lib/projectFilters'

const PROJECTS_PAGE_SIZE = 15

interface WorkSectionProps {
  initialProjects: Project[] | null
  initialFilter: Filter
  // todo: create type for sidebarfilters
  sidebarFilters: any | null
  isProjectsLoading?: boolean
}

function getFilterKey(filter: Filter) {
  return JSON.stringify(filter)
}

export const WorkSection: FC<WorkSectionProps> = ({ initialProjects, initialFilter, sidebarFilters, isProjectsLoading = false }) => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasMouseMoved = useMouseMoved()

  const [visibleProjects, setVisibleProjects] = useState<Project[]>(initialProjects ?? [])
  const [hasMore, setHasMore] = useState((initialProjects?.length ?? 0) >= PROJECTS_PAGE_SIZE)
  const [isLoading, setIsLoading] = useState(isProjectsLoading)
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null)
  const [filter, setFilter] = useState<Filter>(initialFilter)
  const [displayedFilter, setDisplayedFilter] = useState<Filter>(initialFilter)
  const activeSidebarFilters = sidebarFilters
  const hasSkippedInitialFetchRef = useRef(false)

  const displayedProject = hoveredProject

  const renderAsset = (asset: any) => {
    switch (asset.kind) {
      case 'image':
        return <Image key={asset.value._key} src={asset.value.image} alt={asset.value.alt} width={600} height={400} className="rounded-lg" />
      case 'videoUrl':
      case 'video':
        return <VideoPlayer key={asset.value._key} asset={asset} title={asset.value.title} />
      default:
        return null
    }
  }

  useEffect(() => {
    const nextFilter = parseProjectFilter(searchParams, activeSidebarFilters)
    const nextFilterKey = getFilterKey(nextFilter)

    setFilter((currentFilter) => (
      getFilterKey(currentFilter) === nextFilterKey ? currentFilter : nextFilter
    ))
  }, [searchParams, activeSidebarFilters])

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
        setDisplayedFilter(filter)
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

  return (
    <div className={styles.workSection}>
      <ProjectGallery 
        projects={visibleProjects}
        hasMore={hasMore}
        isLoading={isLoading}
        onLoadMore={handleLoadMore}
        onProjectHover={setHoveredProject}
        onProjectLeave={() => setHoveredProject(null)}
        hasMouseMoved={hasMouseMoved}
        isFeaturedProjects={displayedFilter.type === "featured"}
      />
      <Sidebar
        displayedProject={displayedProject}
        sidebarFilters={activeSidebarFilters}
        filter={filter}
        setFilter={handleFilterChange}
        renderAsset={renderAsset}
      />
    </div>
  )
}
