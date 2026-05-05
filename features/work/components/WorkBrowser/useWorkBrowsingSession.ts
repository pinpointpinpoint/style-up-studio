'use client'

import {Dispatch, SetStateAction, useCallback, useEffect, useRef, useState} from 'react'
import type {Filter, Project} from '@/types'
import {getProjects} from '@/app/(site)/actions'
import {
    applyWorkBrowsingPaginationResult,
    applyWorkBrowsingPaginationStart,
    applyWorkFilterChange,
    applyWorkFilterRoute,
    type CachedProjectPage,
    createWorkBrowsingSessionState,
    getWorkBrowsingPaginationRequest,
    getProjectDetailCloseNavigation,
    getProjectGalleryOpenNavigation,
    getProjectHref,
    getWorkBrowsingFilterKey,
    PROJECT_GALLERY_RETURN_URL_KEY,
} from '@/features/work/lib/workBrowsingSession'
import type {SidebarFiltersQueryResult} from '@/sanity.types'

type SearchParamsLike = {
    get(name: string): string | null
    toString(): string
}

type WorkRouter = {
    push(href: string, options?: {scroll?: boolean}): void
    back(): void
}

type WorkBrowsingSessionOptions = {
    initialProjects: Project[] | null
    initialFilter: Filter
    sidebarFilters: SidebarFiltersQueryResult | null
    isProjectsLoading: boolean
    pathname: string
    searchParams: SearchParamsLike
    router: WorkRouter
    pageSize: number
}

function isWorkGalleryPathname(pathname: string) {
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

export function useWorkBrowsingSession({
    initialProjects,
    initialFilter,
    sidebarFilters,
    isProjectsLoading,
    pathname,
    searchParams,
    router,
    pageSize,
}: WorkBrowsingSessionOptions) {
    const [session, setSession] = useState(() =>
        createWorkBrowsingSessionState({
            initialProjects,
            initialFilter,
            isProjectsLoading,
            pageSize,
        }),
    )
    const hasSkippedInitialFetchRef = useRef(false)
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
    const activePageSize = session.pageSize
    const activeFilterKey = getWorkBrowsingFilterKey(activeFilter)

    useEffect(() => {
        if (!isWorkGalleryPathname(pathname)) return

        setSession((currentSession) =>
            applyWorkFilterRoute({
                state: currentSession,
                pathname,
                searchParams,
                sidebarFilters,
                cachedProjectPages: projectPagesByFilterRef.current,
            }).state,
        )
    }, [pathname, searchParams, sidebarFilters])

    useEffect(() => {
        if (!hasSkippedInitialFetchRef.current) {
            hasSkippedInitialFetchRef.current = true
            return
        }

        if (projectPagesByFilterRef.current.has(activeFilterKey)) {
            return
        }

        let isCurrent = true

        async function refreshProjects() {
            setSession((currentSession) => ({...currentSession, isLoading: true}))

            try {
                const nextProjects = await getProjects({
                    filter: activeFilter,
                    cursor: null,
                    limit: activePageSize,
                })

                if (!isCurrent) return

                projectPagesByFilterRef.current.set(activeFilterKey, {
                    visibleProjects: nextProjects,
                    hasMore: nextProjects.length >= activePageSize,
                })

                setSession((currentSession) => ({
                    ...currentSession,
                    visibleProjects: nextProjects,
                    hasMore: nextProjects.length >= currentSession.pageSize,
                    hoveredProject: null,
                    isLoading: false,
                }))
            } finally {
                if (isCurrent) {
                    setSession((currentSession) => ({...currentSession, isLoading: false}))
                }
            }
        }

        refreshProjects()

        return () => {
            isCurrent = false
        }
    }, [activeFilter, activeFilterKey, activePageSize])

    const handleFilterChange: Dispatch<SetStateAction<Filter>> = useCallback(
        (value) => {
            const nextFilter = typeof value === 'function' ? value(session.filter) : value
            const href = applyWorkFilterChange({
                state: session,
                nextFilter,
                cachedProjectPages: projectPagesByFilterRef.current,
                sidebarFilters,
                searchParams,
                pathname,
            }).href

            setSession((currentSession) => {
                const result = applyWorkFilterChange({
                    state: currentSession,
                    nextFilter,
                    cachedProjectPages: projectPagesByFilterRef.current,
                    sidebarFilters,
                    searchParams,
                    pathname,
                })

                return result.state
            })
            router.push(href, {scroll: false})
        },
        [pathname, router, searchParams, session, sidebarFilters],
    )

    const handleLoadMore = useCallback(async () => {
        const request = getWorkBrowsingPaginationRequest(session)

        if (!request) return

        setSession((currentSession) => applyWorkBrowsingPaginationStart(currentSession))

        try {
            const nextProjects = await getProjects(request.input)

            setSession((currentSession) => {
                const result = applyWorkBrowsingPaginationResult({
                    state: currentSession,
                    nextProjects,
                })

                projectPagesByFilterRef.current.set(result.cacheKey, result.cachedProjectPage)

                return result.state
            })
        } finally {
            setSession((currentSession) => ({...currentSession, isLoading: false}))
        }
    }, [session])

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
