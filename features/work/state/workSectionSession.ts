import type {Filter, Project, ProjectsQueryInput} from '@/types'
import { getProjectCursor } from '../lib/projectFilters'
import {createWorkFilterCatalog, type WorkFilterIndexInput} from '../lib/workFilterIndex'

export const PROJECT_GALLERY_RETURN_URL_KEY = 'projectGalleryReturnUrl'

export type WorkSectionSessionState = {
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

export type WorkBrowsingFilterChangeEvent = {
    type: 'filterChange'
    nextFilter: Filter
}

export type WorkBrowsingLoadMoreEvent = {
    type: 'loadMore'
}

export type WorkBrowsingRouteFilterEvent = {
    type: 'routeFilter'
}

export type WorkBrowsingEvent =
    | WorkBrowsingFilterChangeEvent
    | WorkBrowsingLoadMoreEvent
    | WorkBrowsingRouteFilterEvent

type WorkBrowsingEventBaseArgs<Event extends WorkBrowsingEvent> = {
    state: WorkSectionSessionState
    event: Event
    cachedProjectPages: ReadonlyMap<string, CachedProjectPage>
    sidebarFilters: WorkFilterIndexInput
    searchParams: SearchParamsLike
    pathname: string
}

type WorkBrowsingFilterChangeResult = {
    state: WorkSectionSessionState
    navigation: {
        href: string
    }
    request: ProjectsQueryInput | null
    filterKey: string
    didUseCachedProjectPage: boolean
}

type WorkBrowsingLoadMoreResult = {
    state: WorkSectionSessionState
    request: ProjectsQueryInput | null
    filterKey: string
}

type WorkBrowsingRouteFilterResult = {
    state: WorkSectionSessionState
    request: ProjectsQueryInput | null
    filterKey: string
    didChangeFilter: boolean
    didUseCachedProjectPage: boolean
}

type WorkBrowsingEventResult =
    | WorkBrowsingFilterChangeResult
    | WorkBrowsingLoadMoreResult
    | WorkBrowsingRouteFilterResult

export function createWorkSectionSessionState({
    initialProjects,
    initialFilter,
    isProjectsLoading,
    pageSize,
}: {
    initialProjects: Project[] | null
    initialFilter: Filter
    isProjectsLoading: boolean
    pageSize: number
}): WorkSectionSessionState {
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
    state: WorkSectionSessionState
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
    state: WorkSectionSessionState
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

export function applyWorkBrowsingEvent(
    args: WorkBrowsingEventBaseArgs<WorkBrowsingFilterChangeEvent>,
): WorkBrowsingFilterChangeResult
export function applyWorkBrowsingEvent(
    args: WorkBrowsingEventBaseArgs<WorkBrowsingLoadMoreEvent>,
): WorkBrowsingLoadMoreResult
export function applyWorkBrowsingEvent(
    args: WorkBrowsingEventBaseArgs<WorkBrowsingRouteFilterEvent>,
): WorkBrowsingRouteFilterResult
export function applyWorkBrowsingEvent({
    state,
    event,
    cachedProjectPages,
    sidebarFilters,
    searchParams,
    pathname,
}: WorkBrowsingEventBaseArgs<WorkBrowsingEvent>): WorkBrowsingEventResult {
    if (event.type === 'loadMore') {
        const request = getWorkBrowsingPaginationRequest(state)

        if (!request) {
            return {
                state,
                request: null,
                filterKey: getWorkBrowsingFilterKey(state.filter),
            }
        }

        return {
            state: applyWorkBrowsingPaginationStart(state),
            request: request.input,
            filterKey: request.filterKey,
        }
    }

    if (event.type === 'routeFilter') {
        const result = applyWorkFilterRoute({
            state,
            pathname,
            searchParams,
            sidebarFilters,
            cachedProjectPages,
        })
        const nextState =
            result.didChangeFilter && !result.didUseCachedProjectPage
                ? {
                      ...result.state,
                      isLoading: true,
                  }
                : result.state

        return {
            state: nextState,
            request:
                result.didChangeFilter && !result.didUseCachedProjectPage
                    ? getRefreshProjectsInput(nextState)
                    : null,
            filterKey: result.filterKey,
            didChangeFilter: result.didChangeFilter,
            didUseCachedProjectPage: result.didUseCachedProjectPage,
        }
    }

    const result = applyWorkFilterChange({
        state,
        nextFilter: event.nextFilter,
        cachedProjectPages,
        sidebarFilters,
        searchParams,
        pathname,
    })
    const nextState = result.didUseCachedProjectPage
        ? result.state
        : {
              ...result.state,
              isLoading: true,
          }

    return {
        state: nextState,
        navigation: {
            href: result.href,
        },
        request: result.didUseCachedProjectPage ? null : getRefreshProjectsInput(nextState),
        filterKey: result.filterKey,
        didUseCachedProjectPage: result.didUseCachedProjectPage,
    }
}

export function getRefreshProjectsInput(state: WorkSectionSessionState): ProjectsQueryInput {
    return {
        filter: state.filter,
        cursor: null,
        limit: state.pageSize,
    }
}

export function getWorkBrowsingRefreshRequest({
    state,
    cachedProjectPages,
}: {
    state: WorkSectionSessionState
    cachedProjectPages: ReadonlyMap<string, CachedProjectPage>
}) {
    const filterKey = getWorkBrowsingFilterKey(state.filter)

    if (cachedProjectPages.has(filterKey)) return null

    return {
        input: getRefreshProjectsInput(state),
        filterKey,
    }
}

export function applyWorkBrowsingRefreshResult({
    state,
    filterKey,
    nextProjects,
}: {
    state: WorkSectionSessionState
    filterKey?: string
    nextProjects: Project[]
}) {
    if (filterKey && getWorkBrowsingFilterKey(state.filter) !== filterKey) {
        return {
            state,
            cacheKey: null,
            cachedProjectPage: null,
            didApply: false,
        }
    }

    const nextState = {
        ...state,
        visibleProjects: nextProjects,
        hasMore: nextProjects.length >= state.pageSize,
        hoveredProject: null,
        isLoading: false,
    }

    return {
        state: nextState,
        cacheKey: getWorkBrowsingFilterKey(nextState.filter),
        cachedProjectPage: {
            visibleProjects: nextState.visibleProjects,
            hasMore: nextState.hasMore,
        },
        didApply: true,
    }
}

export function applyWorkBrowsingRequestEnd(
    state: WorkSectionSessionState,
): WorkSectionSessionState {
    return {
        ...state,
        isLoading: false,
    }
}

export function getLoadMoreProjectsInput(
    state: WorkSectionSessionState,
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
    state: WorkSectionSessionState,
    nextProjects: Project[],
): WorkSectionSessionState {
    return {
        ...state,
        visibleProjects: [...state.visibleProjects, ...nextProjects],
        hasMore: nextProjects.length >= state.pageSize,
        isLoading: false,
    }
}

export function getWorkBrowsingPaginationRequest(state: WorkSectionSessionState) {
    const input = getLoadMoreProjectsInput(state)

    if (!input) return null

    return {
        input,
        filterKey: getWorkBrowsingFilterKey(state.filter),
    }
}

export function applyWorkBrowsingPaginationStart(
    state: WorkSectionSessionState,
): WorkSectionSessionState {
    return {
        ...state,
        isLoading: true,
    }
}

export function applyWorkBrowsingPaginationResult({
    state,
    nextProjects,
}: {
    state: WorkSectionSessionState
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