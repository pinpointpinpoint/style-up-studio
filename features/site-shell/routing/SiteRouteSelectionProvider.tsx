'use client'

import {
    createContext,
    type MouseEvent,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react'
import {usePathname, useSearchParams} from 'next/navigation'
import type {Project} from '@/types'
import {
    applySiteRouteSelectionEvent,
    getSiteRouteSelectionView,
    type SiteRouteSelectionState,
    type SiteSection,
} from './siteRouteSelection'

type SiteRouteSelectionContextValue = ReturnType<
    typeof getSiteRouteSelectionView<Project>
> & {
    applyRouteProject: (project: Project | null, notFound: boolean) => void
    clearRouteProjectSelection: () => void
    handleSectionNavigation: (
        section: SiteSection,
    ) => (event: MouseEvent<HTMLAnchorElement>) => void
}

const SiteRouteSelectionContext = createContext<SiteRouteSelectionContextValue | null>(null)

export function SiteRouteSelectionProvider({children}: {children: ReactNode}) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [state, setState] = useState<SiteRouteSelectionState<Project>>({
        lastWorkRoute: '/',
        optimisticSection: null,
        projectRouteSelection: {
            project: null,
            notFound: false,
        },
    })
    const view = getSiteRouteSelectionView({
        state,
        pathname,
        searchParams,
    })

    const applyRouteProject = useCallback(
        (project: Project | null, notFound: boolean) => {
            setState((currentState) =>
                applySiteRouteSelectionEvent({
                    state: currentState,
                    event: {
                        type: 'routeProjectLoaded',
                        project,
                        notFound,
                        pathname,
                        searchParams,
                    },
                }).state,
            )
        },
        [pathname, searchParams],
    )

    const clearRouteProjectSelection = useCallback(() => {
        setState((currentState) =>
            applySiteRouteSelectionEvent({
                state: currentState,
                event: {
                    type: 'inactiveProjectRouteCleared',
                    view: getSiteRouteSelectionView({
                        state: currentState,
                        pathname,
                        searchParams,
                    }),
                },
            }).state,
        )
    }, [pathname, searchParams])

    const handleSectionNavigation = useCallback(
        (section: SiteSection) => (event: MouseEvent<HTMLAnchorElement>) => {
            if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                event.button !== 0
            ) {
                return
            }

            setState((currentState) =>
                applySiteRouteSelectionEvent({
                    state: currentState,
                    event: {
                        type: 'sectionNavigationStarted',
                        section,
                        pathname,
                        searchParams,
                    },
                }).state,
            )
        },
        [pathname, searchParams],
    )

    const value = useMemo(
        () => ({
            ...view,
            applyRouteProject,
            clearRouteProjectSelection,
            handleSectionNavigation,
        }),
        [applyRouteProject, clearRouteProjectSelection, handleSectionNavigation, view],
    )

    return (
        <SiteRouteSelectionContext.Provider value={value}>
            {children}
        </SiteRouteSelectionContext.Provider>
    )
}

export function useSiteRouteSelection() {
    const context = useContext(SiteRouteSelectionContext)

    if (!context) {
        throw new Error('useSiteRouteSelection must be used within SiteRouteSelectionProvider')
    }

    return context
}
