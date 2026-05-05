export type WorkRouteSection = 'work' | 'style-ups'

type RouteProjectLike = {
    slug?: string | null
}

export type ProjectRouteSelection<ProjectLike extends RouteProjectLike> = {
    project: ProjectLike | null
    notFound: boolean
}

type SearchParamsLike = {
    toString(): string
}

export function getCurrentRoute(pathname: string, searchParams: SearchParamsLike) {
    const queryString = searchParams.toString()

    return queryString ? `${pathname}?${queryString}` : pathname
}

export function getWorkRouteSection(pathname: string): WorkRouteSection {
    return pathname === '/style-ups' || pathname.startsWith('/style-ups/')
        ? 'style-ups'
        : 'work'
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

    return match?.[1] ? decodeURIComponent(match[1]) : null
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
