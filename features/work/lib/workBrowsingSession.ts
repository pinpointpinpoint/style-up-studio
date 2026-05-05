import type {Filter, Project, ProjectsQueryInput} from '@/types'
import {getProjectCursor} from './projectFilters'
import {createWorkFilterCatalog, type WorkFilterIndexInput} from './workFilterIndex'

export const PROJECT_GALLERY_RETURN_URL_KEY = 'projectGalleryReturnUrl'

export type WorkBrowsingSessionState = {
    filter: Filter
    visibleProjects: Project[]
    hasMore: boolean
    isLoading: boolean
    hoveredProject: Project | null
    pageSize: number
}

export type CachedProjectPage = {
    visibleProjects: Project[]
    hasMore: boolean
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

export function getWorkBrowsingFilterKey(filter: Filter) {
    return JSON.stringify(filter)
}

export function applyWorkFilterChange({
    state,
    nextFilter,
    cachedProjectPages,
    sidebarFilters,
    searchParams,
    pathname,
}: {
    state: WorkBrowsingSessionState
    nextFilter: Filter
    cachedProjectPages: ReadonlyMap<string, CachedProjectPage>
    sidebarFilters: WorkFilterIndexInput
    searchParams: SearchParamsLike
    pathname: string
}) {
    const filterKey = getWorkBrowsingFilterKey(nextFilter)
    const cachedProjectPage = cachedProjectPages.get(filterKey)

    return {
        state: {
            ...state,
            filter: nextFilter,
            visibleProjects: cachedProjectPage?.visibleProjects ?? state.visibleProjects,
            hasMore: cachedProjectPage?.hasMore ?? state.hasMore,
            hoveredProject: null,
            isLoading: cachedProjectPage ? false : state.isLoading,
        },
        href: getWorkFilterNavigationHref({
            filter: nextFilter,
            sidebarFilters,
            searchParams,
            pathname,
        }),
        filterKey,
        didUseCachedProjectPage: Boolean(cachedProjectPage),
    }
}

export function applyWorkFilterRoute({
    state,
    pathname,
    searchParams,
    sidebarFilters,
    cachedProjectPages,
}: {
    state: WorkBrowsingSessionState
    pathname: string
    searchParams: SearchParamsLike
    sidebarFilters: WorkFilterIndexInput
    cachedProjectPages: ReadonlyMap<string, CachedProjectPage>
}) {
    const nextFilter = createWorkFilterCatalog(sidebarFilters).parseFilter(searchParams)
    const filterKey = getWorkBrowsingFilterKey(nextFilter)

    if (getWorkBrowsingFilterKey(state.filter) === filterKey) {
        return {
            state,
            filterKey,
            didChangeFilter: false,
            didUseCachedProjectPage: cachedProjectPages.has(filterKey),
        }
    }

    const result = applyWorkFilterChange({
        state,
        nextFilter,
        cachedProjectPages,
        sidebarFilters,
        searchParams,
        pathname,
    })

    return {
        state: result.state,
        filterKey: result.filterKey,
        didChangeFilter: true,
        didUseCachedProjectPage: result.didUseCachedProjectPage,
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

export function getWorkBrowsingPaginationRequest(state: WorkBrowsingSessionState) {
    const input = getLoadMoreProjectsInput(state)

    if (!input) return null

    return {
        input,
        filterKey: getWorkBrowsingFilterKey(state.filter),
    }
}

export function applyWorkBrowsingPaginationStart(
    state: WorkBrowsingSessionState,
): WorkBrowsingSessionState {
    return {
        ...state,
        isLoading: true,
    }
}

export function applyWorkBrowsingPaginationResult({
    state,
    nextProjects,
}: {
    state: WorkBrowsingSessionState
    nextProjects: Project[]
}) {
    const nextState = appendLoadedProjects(state, nextProjects)

    return {
        state: nextState,
        cacheKey: getWorkBrowsingFilterKey(nextState.filter),
        cachedProjectPage: {
            visibleProjects: nextState.visibleProjects,
            hasMore: nextState.hasMore,
        },
    }
}

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
    sidebarFilters: WorkFilterIndexInput
    searchParams: SearchParamsLike
    pathname: string
}) {
    const nextParams = createWorkFilterCatalog(sidebarFilters).writeFilterToParams(
        filter,
        searchParams,
    )
    const queryString = nextParams.toString()

    return queryString ? `${pathname}?${queryString}` : pathname
}

export function getProjectGalleryReturnUrl(pathname: string, searchParams: SearchParamsLike) {
    const queryString = searchParams.toString()

    return queryString ? `${pathname}?${queryString}` : pathname
}

export function getProjectGalleryOpenNavigation({
    pathname,
    searchParams,
}: {
    pathname: string
    searchParams: SearchParamsLike
}) {
    return {
        storageKey: PROJECT_GALLERY_RETURN_URL_KEY,
        returnUrl: getProjectGalleryReturnUrl(pathname, searchParams),
    }
}

export function getProjectHref(project: Project) {
    return project.slug ? `/work/${project.slug}` : '/'
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
