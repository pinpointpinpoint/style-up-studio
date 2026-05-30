import {
    applyWorkRouteSelectionEvent,
    type WorkRouteSelectionEvent,
    type ProjectRouteSelection,
    type WorkRouteSection,
} from '@/features/work/lib/workRouteSelection'

type RouteProjectLike = {
    slug?: string | null
}

type SearchParamsLike = {
    toString(): string
}

export type SiteSection = WorkRouteSection

export type OptimisticSiteSection = {
    section: SiteSection
    pathname: string
}

export type SiteRouteSelectionState<ProjectLike extends RouteProjectLike> = {
    lastWorkRoute: string
    optimisticSection: OptimisticSiteSection | null
    projectRouteSelection: ProjectRouteSelection<ProjectLike>
}

export type SiteRouteSelectionEvent<ProjectLike extends RouteProjectLike> =
    WorkRouteSelectionEvent<ProjectLike>

export function getSiteRouteSelectionView<ProjectLike extends RouteProjectLike>({
    state,
    pathname,
    searchParams,
}: {
    state: SiteRouteSelectionState<ProjectLike>
    pathname: string
    searchParams: SearchParamsLike
}) {
    const routeResult = applyWorkRouteSelectionEvent({
        state: {
            lastWorkRoute: state.lastWorkRoute,
            projectRouteSelection: state.projectRouteSelection,
        },
        event: {
            type: 'routeChanged',
            pathname,
            searchParams,
        },
    })
    const routeSelection = routeResult.view
    const activeSection =
        state.optimisticSection?.pathname === pathname
            ? state.optimisticSection.section
            : routeSelection.routeSection

    return {
        ...routeSelection,
        activeSection,
        hasRouteProjectSelection: Boolean(
            state.projectRouteSelection.project || state.projectRouteSelection.notFound,
        ),
        workRoute:
            routeSelection.routeSection === 'work'
                ? routeSelection.nextLastWorkRoute
                : state.lastWorkRoute,
    }
}

export function applySiteRouteSelectionEvent<ProjectLike extends RouteProjectLike>({
    state,
    event,
}: {
    state: SiteRouteSelectionState<ProjectLike>
    event: SiteRouteSelectionEvent<ProjectLike>
}) {
    const workState = {
        lastWorkRoute: state.lastWorkRoute,
        projectRouteSelection: state.projectRouteSelection,
    }

    if (event.type === 'sectionNavigationStarted') {
        const result = applyWorkRouteSelectionEvent({
            state: workState,
            event,
        })
        const nextState = {
            ...result.state,
            optimisticSection: result.optimisticSection,
        }

        return {
            state: nextState,
            view: getSiteRouteSelectionView({
                state: nextState,
                pathname: event.pathname,
                searchParams: event.searchParams,
            }),
        }
    }

    if (event.type === 'routeProjectLoaded') {
        const result = applyWorkRouteSelectionEvent({
            state: workState,
            event,
        })
        const nextState = {
            ...result.state,
            optimisticSection: state.optimisticSection,
        }

        return {
            state: nextState,
            view: getSiteRouteSelectionView({
                state: nextState,
                pathname: event.pathname,
                searchParams: event.searchParams,
            }),
        }
    }

    if (event.type === 'inactiveProjectRouteCleared') {
        const result = applyWorkRouteSelectionEvent({
            state: workState,
            event,
        })
        const nextState = {
            ...result.state,
            optimisticSection: state.optimisticSection,
        }

        return {
            state: nextState,
            view: {
                ...result.view,
                activeSection:
                    state.optimisticSection?.pathname === result.view.currentRoute
                        ? state.optimisticSection.section
                        : result.view.routeSection,
                hasRouteProjectSelection: Boolean(
                    nextState.projectRouteSelection.project ||
                        nextState.projectRouteSelection.notFound,
                ),
                workRoute:
                    result.view.routeSection === 'work'
                        ? result.view.nextLastWorkRoute
                        : state.lastWorkRoute,
            },
        }
    }

    const result = applyWorkRouteSelectionEvent({
        state: workState,
        event,
    })
    const nextState = {
        ...result.state,
        optimisticSection: state.optimisticSection,
    }

    return {
        state: nextState,
        view: getSiteRouteSelectionView({
            state: nextState,
            pathname: event.pathname,
            searchParams: event.searchParams,
        }),
    }
}
