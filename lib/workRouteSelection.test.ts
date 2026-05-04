import {describe, expect, it} from 'vitest'
import {
    applyProjectRouteBridge,
    clearProjectRouteSelection,
    getAccordionRouteSelection,
    getProjectSlugFromWorkRoute,
    getRouteProjectView,
    type ProjectRouteSelection,
} from './workRouteSelection'

describe('work route selection', () => {
    it('tracks active work route, project slug, and clears project selection outside detail routes', () => {
        const routeSelection = getAccordionRouteSelection({
            pathname: '/style-ups',
            searchParams: new URLSearchParams('sort=latest'),
            lastWorkRoute: '/work/editorial-story?brand=brand-a',
        })

        expect(routeSelection).toEqual({
            routeSection: 'style-ups',
            currentRoute: '/style-ups?sort=latest',
            visibleWorkRoute: '/work/editorial-story?brand=brand-a',
            nextLastWorkRoute: '/work/editorial-story?brand=brand-a',
        })
        expect(getProjectSlugFromWorkRoute(routeSelection.visibleWorkRoute)).toBe('editorial-story')
        expect(getProjectSlugFromWorkRoute('/')).toBeNull()

        const selectedProject = {
            _id: 'project-1',
            slug: 'editorial-story',
        }
        const selected: ProjectRouteSelection<typeof selectedProject> = applyProjectRouteBridge(
            {
                project: null,
                notFound: false,
            },
            {
                project: selectedProject,
                notFound: false,
            },
        )

        expect(getRouteProjectView('/work/editorial-story', selected)).toEqual({
            selectedProjectSlug: 'editorial-story',
            activeProject: selectedProject,
            isProjectDetail: true,
            routeProjectNotFound: false,
        })
        expect(clearProjectRouteSelection('/', selected)).toEqual({
            project: null,
            notFound: false,
        })
        expect(clearProjectRouteSelection('/style-ups', selected)).toEqual({
            project: null,
            notFound: false,
        })
    })

    it('represents not-found project routes distinctly from unloaded project routes', () => {
        const notFound = applyProjectRouteBridge(
            {
                project: null,
                notFound: false,
            },
            {
                project: null,
                notFound: true,
            },
        )

        expect(getRouteProjectView('/work/missing-project', notFound)).toEqual({
            selectedProjectSlug: 'missing-project',
            activeProject: null,
            isProjectDetail: true,
            routeProjectNotFound: true,
        })
    })
})
