export type WorkRouteSection = 'work' | 'style-ups'

export type ProjectRouteSelection<ProjectLike> = {
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

export function getAccordionRouteSelection({
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

export function applyProjectRouteBridge<ProjectLike>(
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

export function clearProjectRouteSelection<ProjectLike>(
    workRoute: string,
    selection: ProjectRouteSelection<ProjectLike>,
): ProjectRouteSelection<ProjectLike> {
    if (getProjectSlugFromWorkRoute(workRoute)) return selection

    return {
        project: null,
        notFound: false,
    }
}

export function getRouteProjectView<ProjectLike>(
    workRoute: string,
    selection: ProjectRouteSelection<ProjectLike>,
) {
    const selectedProjectSlug = getProjectSlugFromWorkRoute(workRoute)

    return {
        selectedProjectSlug,
        activeProject: selection.project,
        isProjectDetail: Boolean(selectedProjectSlug),
        routeProjectNotFound: selection.notFound,
    }
}
