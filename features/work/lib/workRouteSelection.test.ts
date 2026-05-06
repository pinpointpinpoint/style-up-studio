import {describe, expect, it} from 'vitest'
import {
    applyWorkRouteSelectionEvent,
    applyWorkProjectRouteSelection,
    clearInactiveProjectRouteSelection,
    clearWorkProjectRouteSelection,
    getWorkRouteSelectionView,
    getSiteSectionRouteSelection,
    getProjectSlugFromWorkRoute,
    getWorkProjectRouteView,
    type ProjectRouteSelection,
} from './workRouteSelection'

describe('work route selection', () => {
    it('applies a route change while preserving the last Work project route on Style Ups', () => {
        const selectedProject = {
            _id: 'project-1',
            slug: 'editorial-story',
        }
        const state = {
            lastWorkRoute: '/work/editorial-story?brand=brand-a',
            projectRouteSelection: {
                project: selectedProject,
                notFound: false,
            },
        }

        expect(
            applyWorkRouteSelectionEvent({
                state,
                event: {
                    type: 'routeChanged',
                    pathname: '/style-ups',
                    searchParams: new URLSearchParams('sort=latest'),
                },
            }),
        ).toEqual({
            state,
            view: {
                routeSection: 'style-ups',
                currentRoute: '/style-ups?sort=latest',
                visibleWorkRoute: '/work/editorial-story?brand=brand-a',
                nextLastWorkRoute: '/work/editorial-story?brand=brand-a',
                selectedProjectSlug: 'editorial-story',
                activeProject: selectedProject,
                isProjectDetail: true,
                routeProjectNotFound: false,
            },
        })
    })

    it('starts section navigation by recording the current Work route and optimistic section', () => {
        const selectedProject = {
            _id: 'project-1',
            slug: 'editorial-story',
        }
        const state = {
            lastWorkRoute: '/',
            projectRouteSelection: {
                project: selectedProject,
                notFound: false,
            },
        }

        expect(
            applyWorkRouteSelectionEvent({
                state,
                event: {
                    type: 'sectionNavigationStarted',
                    section: 'style-ups',
                    pathname: '/work/editorial-story',
                    searchParams: new URLSearchParams('brand=brand-a'),
                },
            }),
        ).toEqual({
            state: {
                ...state,
                lastWorkRoute: '/work/editorial-story?brand=brand-a',
            },
            optimisticSection: {
                section: 'style-ups',
                pathname: '/work/editorial-story',
            },
            view: {
                routeSection: 'work',
                currentRoute: '/work/editorial-story?brand=brand-a',
                visibleWorkRoute: '/work/editorial-story?brand=brand-a',
                nextLastWorkRoute: '/work/editorial-story?brand=brand-a',
                selectedProjectSlug: 'editorial-story',
                activeProject: selectedProject,
                isProjectDetail: true,
                routeProjectNotFound: false,
            },
        })
    })

    it('applies a loaded route project and exposes it through the route view', () => {
        const selectedProject = {
            _id: 'project-1',
            slug: 'editorial-story',
        }
        const state = {
            lastWorkRoute: '/',
            projectRouteSelection: {
                project: null,
                notFound: false,
            },
        }

        expect(
            applyWorkRouteSelectionEvent({
                state,
                event: {
                    type: 'routeProjectLoaded',
                    project: selectedProject,
                    notFound: false,
                    pathname: '/work/editorial-story',
                    searchParams: new URLSearchParams(),
                },
            }),
        ).toEqual({
            state: {
                lastWorkRoute: '/work/editorial-story',
                projectRouteSelection: {
                    project: selectedProject,
                    notFound: false,
                },
            },
            view: {
                routeSection: 'work',
                currentRoute: '/work/editorial-story',
                visibleWorkRoute: '/work/editorial-story',
                nextLastWorkRoute: '/work/editorial-story',
                selectedProjectSlug: 'editorial-story',
                activeProject: selectedProject,
                isProjectDetail: true,
                routeProjectNotFound: false,
            },
        })
    })

    it('clears inactive route project state through the route selection event interface', () => {
        const selectedProject = {
            _id: 'project-1',
            slug: 'editorial-story',
        }
        const state = {
            lastWorkRoute: '/',
            projectRouteSelection: {
                project: selectedProject,
                notFound: true,
            },
        }

        expect(
            applyWorkRouteSelectionEvent({
                state,
                event: {
                    type: 'inactiveProjectRouteCleared',
                    view: getWorkRouteSelectionView({
                        pathname: '/',
                        searchParams: new URLSearchParams(),
                        lastWorkRoute: '/',
                        projectRouteSelection: state.projectRouteSelection,
                    }),
                },
            }),
        ).toEqual({
            state: {
                lastWorkRoute: '/',
                projectRouteSelection: {
                    project: null,
                    notFound: false,
                },
            },
            view: {
                routeSection: 'work',
                currentRoute: '/',
                visibleWorkRoute: '/',
                nextLastWorkRoute: '/',
                selectedProjectSlug: null,
                activeProject: null,
                isProjectDetail: false,
                routeProjectNotFound: false,
            },
        })
    })

    it('shows Style Ups as the active section while preserving the last Work project route', () => {
        const selectedProject = {
            _id: 'project-1',
            slug: 'editorial-story',
        }

        expect(
            getWorkRouteSelectionView({
                pathname: '/style-ups',
                searchParams: new URLSearchParams('sort=latest'),
                lastWorkRoute: '/work/editorial-story?brand=brand-a',
                projectRouteSelection: {
                    project: selectedProject,
                    notFound: false,
                },
            }),
        ).toEqual({
            routeSection: 'style-ups',
            currentRoute: '/style-ups?sort=latest',
            visibleWorkRoute: '/work/editorial-story?brand=brand-a',
            nextLastWorkRoute: '/work/editorial-story?brand=brand-a',
            selectedProjectSlug: 'editorial-story',
            activeProject: selectedProject,
            isProjectDetail: true,
            routeProjectNotFound: false,
        })
    })

    it('selects the matching project for a direct Work project route', () => {
        const selectedProject = {
            _id: 'project-1',
            slug: 'editorial-story',
        }

        expect(
            getWorkRouteSelectionView({
                pathname: '/work/editorial-story',
                searchParams: new URLSearchParams('brand=brand-a'),
                lastWorkRoute: '/',
                projectRouteSelection: {
                    project: selectedProject,
                    notFound: false,
                },
            }),
        ).toEqual({
            routeSection: 'work',
            currentRoute: '/work/editorial-story?brand=brand-a',
            visibleWorkRoute: '/work/editorial-story?brand=brand-a',
            nextLastWorkRoute: '/work/editorial-story?brand=brand-a',
            selectedProjectSlug: 'editorial-story',
            activeProject: selectedProject,
            isProjectDetail: true,
            routeProjectNotFound: false,
        })
    })

    it('keeps not-found project routes distinct from unloaded project routes in the route view', () => {
        expect(
            getWorkRouteSelectionView({
                pathname: '/work/missing-project',
                searchParams: new URLSearchParams(),
                lastWorkRoute: '/',
                projectRouteSelection: {
                    project: null,
                    notFound: true,
                },
            }),
        ).toEqual({
            routeSection: 'work',
            currentRoute: '/work/missing-project',
            visibleWorkRoute: '/work/missing-project',
            nextLastWorkRoute: '/work/missing-project',
            selectedProjectSlug: 'missing-project',
            activeProject: null,
            isProjectDetail: true,
            routeProjectNotFound: true,
        })
    })

    it('clears stale project route selection when the visible Work route is not a project route', () => {
        const selectedProject = {
            _id: 'project-1',
            slug: 'editorial-story',
        }

        expect(
            clearInactiveProjectRouteSelection({
                view: getWorkRouteSelectionView({
                    pathname: '/',
                    searchParams: new URLSearchParams(),
                    lastWorkRoute: '/work/editorial-story',
                    projectRouteSelection: {
                        project: selectedProject,
                        notFound: true,
                    },
                }),
                projectRouteSelection: {
                    project: selectedProject,
                    notFound: true,
                },
            }),
        ).toEqual({
            project: null,
            notFound: false,
        })
    })

    it('tracks active work route, project slug, and clears project selection outside detail routes', () => {
        const routeSelection = getSiteSectionRouteSelection({
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
        const selected: ProjectRouteSelection<typeof selectedProject> = applyWorkProjectRouteSelection(
            {
                project: null,
                notFound: false,
            },
            {
                project: selectedProject,
                notFound: false,
            },
        )

        expect(getWorkProjectRouteView('/work/editorial-story', selected)).toEqual({
            selectedProjectSlug: 'editorial-story',
            activeProject: selectedProject,
            isProjectDetail: true,
            routeProjectNotFound: false,
        })
        expect(clearWorkProjectRouteSelection('/', selected)).toEqual({
            project: null,
            notFound: false,
        })
        expect(clearWorkProjectRouteSelection('/style-ups', selected)).toEqual({
            project: null,
            notFound: false,
        })
    })

    it('represents not-found project routes distinctly from unloaded project routes', () => {
        const notFound = applyWorkProjectRouteSelection(
            {
                project: null,
                notFound: false,
            },
            {
                project: null,
                notFound: true,
            },
        )

        expect(getWorkProjectRouteView('/work/missing-project', notFound)).toEqual({
            selectedProjectSlug: 'missing-project',
            activeProject: null,
            isProjectDetail: true,
            routeProjectNotFound: true,
        })
    })

    it('does not expose stale project or not-found state outside the matching project route', () => {
        const selectedProject = {
            _id: 'project-1',
            slug: 'editorial-story',
        }
        const selected: ProjectRouteSelection<typeof selectedProject> = {
            project: selectedProject,
            notFound: false,
        }

        expect(getWorkProjectRouteView('/work/different-story', selected)).toEqual({
            selectedProjectSlug: 'different-story',
            activeProject: null,
            isProjectDetail: true,
            routeProjectNotFound: false,
        })
        expect(getWorkProjectRouteView('/', {...selected, notFound: true})).toEqual({
            selectedProjectSlug: null,
            activeProject: null,
            isProjectDetail: false,
            routeProjectNotFound: false,
        })
    })
})
