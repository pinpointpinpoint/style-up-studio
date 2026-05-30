'use client'

import {Dispatch, SetStateAction, useCallback, useEffect, useRef, useState} from 'react'
import type {Filter, Project} from '@/types'
import {getProjects} from '@/app/(site)/actions'
import {
    applyWorkBrowsingEvent,
    applyWorkBrowsingPaginationResult,
    applyWorkBrowsingRequestEnd,
    applyWorkBrowsingRefreshResult,
    type CachedProjectPage,
    createWorkSectionSessionState,
    getProjectDetailCloseNavigation,
    getProjectGalleryOpenNavigation,
    getProjectHref,
    getWorkBrowsingRefreshRequest,
    getWorkBrowsingFilterKey,
    PROJECT_GALLERY_RETURN_URL_KEY,
} from '@/features/work/lib/session/workSectionSession'
import type {SidebarFiltersQueryResult} from '@/sanity.types'

type SearchParamsLike = {
    get(name: string): string | null
    toString(): string
}

type WorkRouter = {
    push(href: string, options?: {scroll?: boolean}): void
    back(): void
}

type WorkSectionSessionOptions = {
    initialProjects: Project[] | null
    initialFilter: Filter
    sidebarFilters: SidebarFiltersQueryResult | null
    isProjectsLoading: boolean
    pathname: string
    searchParams: SearchParamsLike
    router: WorkRouter
    pageSize: number
}

function isWorkSectionPathname(pathname: string) {
    return pathname === '/'
}

function canGoBackToSameOrigin() {
    try {
        const referrer = document.referrer ? new URL(document.referrer) : null

        return Boolean(
            referrer && referrer.origin === window.location.origin && window.history.length > 1,
        )
    } catch {
        return false
    }
}

export function useWorkSectionSession({
    initialProjects,
    initialFilter,
    sidebarFilters,
    isProjectsLoading,
    pathname,
    searchParams,
    router,
    pageSize,
}: WorkSectionSessionOptions) {
    const [session, setSession] = useState(() =>
        createWorkSectionSessionState({
            initialProjects,
            initialFilter,
            isProjectsLoading,
            pageSize,
        }),
    )
    const hasSkippedInitialFetchRef = useRef(false)
    const inFlightRefreshFilterKeyRef = useRef<string | null>(null)
    const sessionRef = useRef(session)
    const projectPagesByFilterRef = useRef(
        new Map<string, CachedProjectPage>([
            [
                getWorkBrowsingFilterKey(initialFilter),
                {
                    visibleProjects: initialProjects ?? [],
                    hasMore: (initialProjects?.length ?? 0) >= pageSize,
                },
            ],
        ]),
    )
    const activeFilter = session.filter
    const activeFilterKey = getWorkBrowsingFilterKey(activeFilter)

    useEffect(() => {
        sessionRef.current = session
    }, [session])

    useEffect(() => {
        if (!isWorkSectionPathname(pathname)) return

        setSession((currentSession) => {
            const result = applyWorkBrowsingEvent({
                state: currentSession,
                event: {
                    type: 'routeFilter',
                },
                pathname,
                searchParams,
                sidebarFilters,
                cachedProjectPages: projectPagesByFilterRef.current,
            })

            return result.state
        })
    }, [pathname, searchParams, sidebarFilters])

    useEffect(() => {
        if (!hasSkippedInitialFetchRef.current) {
            hasSkippedInitialFetchRef.current = true
            return
        }

        const request = getWorkBrowsingRefreshRequest({
            state: sessionRef.current,
            cachedProjectPages: projectPagesByFilterRef.current,
        })

        if (!request || inFlightRefreshFilterKeyRef.current === request.filterKey) {
            return
        }

        const refreshRequest = request
        let isCurrent = true
        inFlightRefreshFilterKeyRef.current = refreshRequest.filterKey

        async function refreshProjects() {
            setSession((currentSession) => ({...currentSession, isLoading: true}))

            try {
                const nextProjects = await getProjects(refreshRequest.input)

                if (!isCurrent) return

                setSession((currentSession) => {
                    const result = applyWorkBrowsingRefreshResult({
                        state: currentSession,
                        filterKey: refreshRequest.filterKey,
                        nextProjects,
                    })

                    if (result.didApply && result.cacheKey && result.cachedProjectPage) {
                        projectPagesByFilterRef.current.set(
                            result.cacheKey,
                            result.cachedProjectPage,
                        )
                    }

                    return result.state
                })
            } finally {
                if (inFlightRefreshFilterKeyRef.current === refreshRequest.filterKey) {
                    inFlightRefreshFilterKeyRef.current = null
                }

                if (isCurrent) {
                    setSession((currentSession) => applyWorkBrowsingRequestEnd(currentSession))
                }
            }
        }

        refreshProjects()

        return () => {
            isCurrent = false
        }
    }, [activeFilterKey])

    const handleFilterChange: Dispatch<SetStateAction<Filter>> = useCallback(
        (value) => {
            const nextFilter = typeof value === 'function' ? value(session.filter) : value
            const result = applyWorkBrowsingEvent({
                state: session,
                event: {
                    type: 'filterChange',
                    nextFilter,
                },
                cachedProjectPages: projectPagesByFilterRef.current,
                sidebarFilters,
                searchParams,
                pathname,
            })

            setSession(result.state)
            router.push(result.navigation.href, {scroll: false})
        },
        [pathname, router, searchParams, session, sidebarFilters],
    )

    const handleLoadMore = useCallback(async () => {
        const result = applyWorkBrowsingEvent({
            state: session,
            event: {
                type: 'loadMore',
            },
            cachedProjectPages: projectPagesByFilterRef.current,
            sidebarFilters,
            searchParams,
            pathname,
        })
        const request = result.request

        if (!request) return

        setSession(result.state)

        try {
            const nextProjects = await getProjects(request)

            setSession((currentSession) => {
                const result = applyWorkBrowsingPaginationResult({
                    state: currentSession,
                    nextProjects,
                })

                projectPagesByFilterRef.current.set(result.cacheKey, result.cachedProjectPage)

                return result.state
            })
        } finally {
            setSession((currentSession) => applyWorkBrowsingRequestEnd(currentSession))
        }
    }, [pathname, searchParams, session, sidebarFilters])

    const handleProjectOpen = useCallback(() => {
        const navigation = getProjectGalleryOpenNavigation({pathname, searchParams})

        sessionStorage.setItem(navigation.storageKey, navigation.returnUrl)
    }, [pathname, searchParams])

    const handleProjectDetailClose = useCallback(() => {
        const savedReturnUrl = sessionStorage.getItem(PROJECT_GALLERY_RETURN_URL_KEY)
        const navigation = getProjectDetailCloseNavigation({
            savedReturnUrl,
            canGoBackToSameOrigin: canGoBackToSameOrigin(),
        })

        if (navigation.clearSavedReturnUrl) {
            sessionStorage.removeItem(PROJECT_GALLERY_RETURN_URL_KEY)
        }

        if (navigation.type === 'back') {
            router.back()
            return
        }

        router.push(navigation.href)
    }, [router])

    const setHoveredProject = useCallback((project: Project | null) => {
        setSession((currentSession) => ({...currentSession, hoveredProject: project}))
    }, [])

    return {
        visibleProjects: session.visibleProjects,
        hasMore: session.hasMore,
        isLoading: session.isLoading,
        hoveredProject: session.hoveredProject,
        filter: session.filter,
        setFilter: handleFilterChange,
        loadMore: handleLoadMore,
        getProjectHref,
        handleProjectOpen,
        handleProjectDetailClose,
        setHoveredProject,
    }
}
