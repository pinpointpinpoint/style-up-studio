'use client'

import {Dispatch, SetStateAction, useCallback, useEffect, useRef, useState} from 'react'
import type {Filter, Project} from '@/types'
import {getProjects} from '@/app/(site)/actions'
import {
    appendLoadedProjects,
    createWorkBrowsingSessionState,
    getLoadMoreProjectsInput,
    getProjectDetailCloseNavigation,
    getProjectGalleryReturnUrl,
    getWorkFilterNavigationHref,
} from '@/lib/workBrowsingSession'
import {parseWorkFilter} from '@/lib/workFilterIndex'
import type {SidebarFiltersQueryResult} from '@/sanity.types'

const PROJECT_GALLERY_RETURN_URL_KEY = 'projectGalleryReturnUrl'

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

function getFilterKey(filter: Filter) {
    return JSON.stringify(filter)
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
    const activeFilter = session.filter
    const activePageSize = session.pageSize

    useEffect(() => {
        if (!isWorkGalleryPathname(pathname)) return

        const nextFilter = parseWorkFilter(searchParams, sidebarFilters)
        const nextFilterKey = getFilterKey(nextFilter)

        setSession((currentSession) =>
            getFilterKey(currentSession.filter) === nextFilterKey
                ? currentSession
                : {...currentSession, filter: nextFilter},
        )
    }, [pathname, searchParams, sidebarFilters])

    useEffect(() => {
        if (!hasSkippedInitialFetchRef.current) {
            hasSkippedInitialFetchRef.current = true
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
    }, [activeFilter, activePageSize])

    const handleFilterChange: Dispatch<SetStateAction<Filter>> = useCallback(
        (value) => {
            const nextFilter = typeof value === 'function' ? value(session.filter) : value
            const href = getWorkFilterNavigationHref({
                filter: nextFilter,
                sidebarFilters,
                searchParams,
                pathname,
            })

            setSession((currentSession) => ({...currentSession, filter: nextFilter}))
            router.push(href, {scroll: false})
        },
        [pathname, router, searchParams, session.filter, sidebarFilters],
    )

    const handleLoadMore = useCallback(async () => {
        const input = getLoadMoreProjectsInput(session)

        if (!input) return

        setSession((currentSession) => ({...currentSession, isLoading: true}))

        try {
            const nextProjects = await getProjects(input)

            setSession((currentSession) => appendLoadedProjects(currentSession, nextProjects))
        } finally {
            setSession((currentSession) => ({...currentSession, isLoading: false}))
        }
    }, [session])

    const getProjectHref = useCallback((project: Project) => {
        return project.slug ? `/work/${project.slug}` : '/'
    }, [])

    const handleProjectOpen = useCallback(() => {
        sessionStorage.setItem(
            PROJECT_GALLERY_RETURN_URL_KEY,
            getProjectGalleryReturnUrl(pathname, searchParams),
        )
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
