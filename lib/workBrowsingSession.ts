import type {Filter, Project, ProjectsQueryInput} from '@/types'
import {getProjectCursor} from './projectFilters'
import {writeWorkFilterToParams} from './workFilterIndex'

export type WorkBrowsingSessionState = {
    filter: Filter
    visibleProjects: Project[]
    hasMore: boolean
    isLoading: boolean
    hoveredProject: Project | null
    pageSize: number
}

export function createWorkBrowsingSessionState({
    initialProjects,
    initialFilter,
    isProjectsLoading,
    pageSize,
}: {
    initialProjects: Project[] | null
    initialFilter: Filter
    isProjectsLoading: boolean
    pageSize: number
}): WorkBrowsingSessionState {
    const visibleProjects = initialProjects ?? []

    return {
        filter: initialFilter,
        visibleProjects,
        hasMore: visibleProjects.length >= pageSize,
        isLoading: isProjectsLoading,
        hoveredProject: null,
        pageSize,
    }
}

export function getRefreshProjectsInput(state: WorkBrowsingSessionState): ProjectsQueryInput {
    return {
        filter: state.filter,
        cursor: null,
        limit: state.pageSize,
    }
}

export function getLoadMoreProjectsInput(
    state: WorkBrowsingSessionState,
): ProjectsQueryInput | null {
    if (state.isLoading || !state.hasMore) return null

    return {
        filter: state.filter,
        cursor: getProjectCursor(
            state.visibleProjects[state.visibleProjects.length - 1],
            state.filter,
        ),
        limit: state.pageSize,
    }
}

export function appendLoadedProjects(
    state: WorkBrowsingSessionState,
    nextProjects: Project[],
): WorkBrowsingSessionState {
    return {
        ...state,
        visibleProjects: [...state.visibleProjects, ...nextProjects],
        hasMore: nextProjects.length >= state.pageSize,
        isLoading: false,
    }
}

type SidebarFilterItem = {
    _id: string
    title?: string | null
    slug?: string | null
    referenceCount: number
}

type SidebarFilterSettings = {
    showPersonalities?: boolean | null
    showBrands?: boolean | null
}

type WorkBrowsingSidebarFilters = {
    featuredCount?: number | null
    allCount?: number | null
    projectTypes: SidebarFilterItem[]
    personalities: SidebarFilterItem[]
    brands: SidebarFilterItem[]
    settings?: SidebarFilterSettings | null
} | null

type SearchParamsLike =
    | URLSearchParams
    | {
          get(name: string): string | null
          toString(): string
      }

export function getWorkFilterNavigationHref({
    filter,
    sidebarFilters,
    searchParams,
    pathname,
}: {
    filter: Filter
    sidebarFilters: WorkBrowsingSidebarFilters
    searchParams: SearchParamsLike
    pathname: string
}) {
    const nextParams = writeWorkFilterToParams(filter, sidebarFilters, searchParams)
    const queryString = nextParams.toString()

    return queryString ? `${pathname}?${queryString}` : pathname
}

export function getProjectGalleryReturnUrl(pathname: string, searchParams: SearchParamsLike) {
    const queryString = searchParams.toString()

    return queryString ? `${pathname}?${queryString}` : pathname
}

export type ProjectDetailCloseNavigation =
    | {
          type: 'push'
          href: string
          clearSavedReturnUrl: boolean
      }
    | {
          type: 'back'
          clearSavedReturnUrl: boolean
      }

export function getProjectDetailCloseNavigation({
    savedReturnUrl,
    canGoBackToSameOrigin,
}: {
    savedReturnUrl: string | null
    canGoBackToSameOrigin: boolean
}): ProjectDetailCloseNavigation {
    if (savedReturnUrl) {
        return {
            type: 'push',
            href: savedReturnUrl,
            clearSavedReturnUrl: true,
        }
    }

    if (canGoBackToSameOrigin) {
        return {
            type: 'back',
            clearSavedReturnUrl: false,
        }
    }

    return {
        type: 'push',
        href: '/',
        clearSavedReturnUrl: false,
    }
}
