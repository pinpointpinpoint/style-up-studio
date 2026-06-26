export type WorkRouteSection = 'work' | 'style-ups'

type RouteProjectLike = {
    slug?: string | null
}

export type ProjectRouteSelection<ProjectLike extends RouteProjectLike> = {
    project: ProjectLike | null
    notFound: boolean
}

export type WorkRouteSelectionState<ProjectLike extends RouteProjectLike> = {
    lastWorkRoute: string
    projectRouteSelection: ProjectRouteSelection<ProjectLike>
}

export type WorkRouteChangedEvent = {
    type: 'routeChanged'
    pathname: string
    searchParams: SearchParamsLike
}

export type WorkSectionNavigationStartedEvent = {
    type: 'sectionNavigationStarted'
    section: WorkRouteSection
    pathname: string
    searchParams: SearchParamsLike
}

export type WorkRouteProjectLoadedEvent<ProjectLike extends RouteProjectLike> = {
    type: 'routeProjectLoaded'
    project: ProjectLike | null
    notFound: boolean
    pathname: string
    searchParams: SearchParamsLike
}

export type WorkInactiveProjectRouteClearedEvent<ProjectLike extends RouteProjectLike> = {
    type: 'inactiveProjectRouteCleared'
    view: ReturnType<typeof getWorkRouteSelectionView<ProjectLike>>
}

export type WorkRouteSelectionEvent<ProjectLike extends RouteProjectLike = RouteProjectLike> =
    | WorkRouteChangedEvent
    | WorkSectionNavigationStartedEvent
    | WorkRouteProjectLoadedEvent<ProjectLike>
    | WorkInactiveProjectRouteClearedEvent<ProjectLike>

type WorkRouteSelectionEventResult<ProjectLike extends RouteProjectLike> = {
    state: WorkRouteSelectionState<ProjectLike>
    view: ReturnType<typeof getWorkRouteSelectionView<ProjectLike>>
}

type WorkSectionNavigationStartedResult<ProjectLike extends RouteProjectLike> =
    WorkRouteSelectionEventResult<ProjectLike> & {
        optimisticSection: {
            section: WorkRouteSection
            pathname: string
        } | null
    }

type SearchParamsLike = {
    toString(): string
}

export function getCurrentRoute(pathname: string, searchParams: SearchParamsLike) {
    const queryString = searchParams.toString()

    return queryString ? `${pathname}?${queryString}` : pathname
}

export function getWorkRouteSection(pathname: string): WorkRouteSection {
    return pathname === '/style-ups' || pathname.startsWith('/style-ups/') ? 'style-ups' : 'work'
}

export function getSiteSectionRouteSelection({
    pathname,
    searchParams,
    lastWorkRoute,
}: {
    pathname: string
    searchParams: SearchParamsLike
    lastWorkRoute: string
}) {
    const routeSection = getWorkRouteSection(pathname)
    const currentRoute = getCurrentRoute(pathname, searchParams)
    const nextLastWorkRoute = routeSection === 'work' ? currentRoute || '/' : lastWorkRoute

    return {
        routeSection,
        currentRoute,
        visibleWorkRoute: routeSection === 'work' ? currentRoute : lastWorkRoute,
        nextLastWorkRoute,
    }
}

export function getProjectSlugFromWorkRoute(workRoute: string) {
    const pathname = workRoute.split('?')[0]?.split('#')[0] ?? workRoute
    const match = pathname.match(/^\/work\/([^/?#]+)/)
    const firstSegment = match?.[1] ? decodeURIComponent(match[1]) : null

    if (
        firstSegment === 'all' ||
        firstSegment === 'type' ||
        firstSegment === 'brand' ||
        firstSegment === 'personality'
    ) {
        return null
    }

    return firstSegment
}

export function applyWorkProjectRouteSelection<ProjectLike extends RouteProjectLike>(
    _current: ProjectRouteSelection<ProjectLike>,
    next: {
        project: ProjectLike | null
        notFound: boolean
    },
): ProjectRouteSelection<ProjectLike> {
    if (next.notFound) {
        return {
            project: null,
            notFound: true,
        }
    }

    return {
        project: next.project,
        notFound: false,
    }
}

export function clearWorkProjectRouteSelection<ProjectLike extends RouteProjectLike>(
    workRoute: string,
    selection: ProjectRouteSelection<ProjectLike>,
): ProjectRouteSelection<ProjectLike> {
    if (getProjectSlugFromWorkRoute(workRoute)) return selection

    return {
        project: null,
        notFound: false,
    }
}

export function getWorkProjectRouteView<ProjectLike extends RouteProjectLike>(
    workRoute: string,
    selection: ProjectRouteSelection<ProjectLike>,
) {
    const selectedProjectSlug = getProjectSlugFromWorkRoute(workRoute)
    const routeProjectSlug = selection.project?.slug ?? null
    const hasMatchingProject =
        Boolean(selectedProjectSlug) && selectedProjectSlug === routeProjectSlug

    return {
        selectedProjectSlug,
        activeProject: hasMatchingProject ? selection.project : null,
        isProjectDetail: Boolean(selectedProjectSlug),
        routeProjectNotFound: Boolean(selectedProjectSlug && selection.notFound),
    }
}

export function getWorkRouteSelectionView<ProjectLike extends RouteProjectLike>({
    pathname,
    searchParams,
    lastWorkRoute,
    projectRouteSelection,
}: {
    pathname: string
    searchParams: SearchParamsLike
    lastWorkRoute: string
    projectRouteSelection: ProjectRouteSelection<ProjectLike>
}) {
    const routeSelection = getSiteSectionRouteSelection({
        pathname,
        searchParams,
        lastWorkRoute,
    })
    const projectView = getWorkProjectRouteView(
        routeSelection.visibleWorkRoute,
        projectRouteSelection,
    )

    return {
        ...routeSelection,
        ...projectView,
    }
}

export function applyWorkRouteSelectionEvent<ProjectLike extends RouteProjectLike>(args: {
    state: WorkRouteSelectionState<ProjectLike>
    event: WorkRouteChangedEvent
}): WorkRouteSelectionEventResult<ProjectLike>
export function applyWorkRouteSelectionEvent<ProjectLike extends RouteProjectLike>(args: {
    state: WorkRouteSelectionState<ProjectLike>
    event: WorkSectionNavigationStartedEvent
}): WorkSectionNavigationStartedResult<ProjectLike>
export function applyWorkRouteSelectionEvent<ProjectLike extends RouteProjectLike>(args: {
    state: WorkRouteSelectionState<ProjectLike>
    event: WorkRouteProjectLoadedEvent<ProjectLike>
}): WorkRouteSelectionEventResult<ProjectLike>
export function applyWorkRouteSelectionEvent<ProjectLike extends RouteProjectLike>(args: {
    state: WorkRouteSelectionState<ProjectLike>
    event: WorkInactiveProjectRouteClearedEvent<ProjectLike>
}): WorkRouteSelectionEventResult<ProjectLike>
export function applyWorkRouteSelectionEvent<ProjectLike extends RouteProjectLike>({
    state,
    event,
}: {
    state: WorkRouteSelectionState<ProjectLike>
    event: WorkRouteSelectionEvent<ProjectLike>
}): WorkRouteSelectionEventResult<ProjectLike> | WorkSectionNavigationStartedResult<ProjectLike> {
    if (event.type === 'sectionNavigationStarted') {
        const view = getWorkRouteSelectionView({
            pathname: event.pathname,
            searchParams: event.searchParams,
            lastWorkRoute: state.lastWorkRoute,
            projectRouteSelection: state.projectRouteSelection,
        })

        return {
            state: {
                ...state,
                lastWorkRoute: view.nextLastWorkRoute,
            },
            optimisticSection:
                event.section === view.routeSection
                    ? null
                    : {
                          section: event.section,
                          pathname: event.pathname,
                      },
            view,
        }
    }

    if (event.type === 'routeProjectLoaded') {
        const nextProjectRouteSelection = applyWorkProjectRouteSelection(
            state.projectRouteSelection,
            {
                project: event.project,
                notFound: event.notFound,
            },
        )
        const view = getWorkRouteSelectionView({
            pathname: event.pathname,
            searchParams: event.searchParams,
            lastWorkRoute: state.lastWorkRoute,
            projectRouteSelection: nextProjectRouteSelection,
        })

        return {
            state: {
                ...state,
                lastWorkRoute: view.nextLastWorkRoute,
                projectRouteSelection: nextProjectRouteSelection,
            },
            view,
        }
    }

    if (event.type === 'inactiveProjectRouteCleared') {
        const nextProjectRouteSelection = clearInactiveProjectRouteSelection({
            view: event.view,
            projectRouteSelection: state.projectRouteSelection,
        })
        const projectView = getWorkProjectRouteView(
            event.view.visibleWorkRoute,
            nextProjectRouteSelection,
        )

        return {
            state: {
                ...state,
                lastWorkRoute: event.view.nextLastWorkRoute,
                projectRouteSelection: nextProjectRouteSelection,
            },
            view: {
                ...event.view,
                ...projectView,
            },
        }
    }

    const view = getWorkRouteSelectionView({
        pathname: event.pathname,
        searchParams: event.searchParams,
        lastWorkRoute: state.lastWorkRoute,
        projectRouteSelection: state.projectRouteSelection,
    })

    return {
        state: {
            ...state,
            lastWorkRoute: view.nextLastWorkRoute,
        },
        view,
    }
}

export function clearInactiveProjectRouteSelection<ProjectLike extends RouteProjectLike>({
    view,
    projectRouteSelection,
}: {
    view: {
        selectedProjectSlug: string | null
    }
    projectRouteSelection: ProjectRouteSelection<ProjectLike>
}): ProjectRouteSelection<ProjectLike> {
    if (view.selectedProjectSlug) return projectRouteSelection

    return {
        project: null,
        notFound: false,
    }
}
