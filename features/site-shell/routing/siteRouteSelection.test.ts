import {describe, expect, it} from 'vitest'
import {
    applySiteRouteSelectionEvent,
    getSiteRouteSelectionView,
    type SiteRouteSelectionState,
} from './siteRouteSelection'

describe('site route selection', () => {
    it('selects a directly loaded Work project route through the site route view', () => {
        const selectedProject = {
            _id: 'project-1',
            slug: 'editorial-story',
        }
        const state: SiteRouteSelectionState<typeof selectedProject> = {
            lastWorkRoute: '/',
            optimisticSection: null,
            projectRouteSelection: {
                project: null,
                notFound: false,
            },
        }

        expect(
            applySiteRouteSelectionEvent({
                state,
                event: {
                    type: 'routeProjectLoaded',
                    project: selectedProject,
                    notFound: false,
                    pathname: '/work/editorial-story',
                    searchParams: new URLSearchParams('source=gallery'),
                },
            }),
        ).toEqual({
            state: {
                lastWorkRoute: '/work/editorial-story?source=gallery',
                optimisticSection: null,
                projectRouteSelection: {
                    project: selectedProject,
                    notFound: false,
                },
            },
            view: {
                activeProject: selectedProject,
                activeSection: 'work',
                currentRoute: '/work/editorial-story?source=gallery',
                hasRouteProjectSelection: true,
                isProjectDetail: true,
                nextLastWorkRoute: '/work/editorial-story?source=gallery',
                routeProjectNotFound: false,
                routeSection: 'work',
                selectedProjectSlug: 'editorial-story',
                visibleWorkRoute: '/work/editorial-story?source=gallery',
                workRoute: '/work/editorial-story?source=gallery',
            },
        })
    })

    it('exposes missing Work project routes as not-found project detail state', () => {
        const state: SiteRouteSelectionState<{slug: string}> = {
            lastWorkRoute: '/',
            optimisticSection: null,
            projectRouteSelection: {
                project: null,
                notFound: false,
            },
        }

        expect(
            applySiteRouteSelectionEvent({
                state,
                event: {
                    type: 'routeProjectLoaded',
                    project: null,
                    notFound: true,
                    pathname: '/work/missing-project',
                    searchParams: new URLSearchParams(),
                },
            }),
        ).toEqual({
            state: {
                lastWorkRoute: '/work/missing-project',
                optimisticSection: null,
                projectRouteSelection: {
                    project: null,
                    notFound: true,
                },
            },
            view: {
                activeProject: null,
                activeSection: 'work',
                currentRoute: '/work/missing-project',
                hasRouteProjectSelection: true,
                isProjectDetail: true,
                nextLastWorkRoute: '/work/missing-project',
                routeProjectNotFound: true,
                routeSection: 'work',
                selectedProjectSlug: 'missing-project',
                visibleWorkRoute: '/work/missing-project',
                workRoute: '/work/missing-project',
            },
        })
    })

    it('exposes a unified route view while Style Ups preserves the remembered Work project route', () => {
        const selectedProject = {
            _id: 'project-1',
            slug: 'editorial-story',
        }
        const state: SiteRouteSelectionState<typeof selectedProject> = {
            lastWorkRoute: '/work/editorial-story?source=gallery',
            optimisticSection: null,
            projectRouteSelection: {
                project: selectedProject,
                notFound: false,
            },
        }

        expect(
            getSiteRouteSelectionView({
                state,
                pathname: '/style-ups',
                searchParams: new URLSearchParams('sort=latest'),
            }),
        ).toEqual({
            activeProject: selectedProject,
            activeSection: 'style-ups',
            currentRoute: '/style-ups?sort=latest',
            hasRouteProjectSelection: true,
            isProjectDetail: true,
            nextLastWorkRoute: '/work/editorial-story?source=gallery',
            routeProjectNotFound: false,
            routeSection: 'style-ups',
            selectedProjectSlug: 'editorial-story',
            visibleWorkRoute: '/work/editorial-story?source=gallery',
            workRoute: '/work/editorial-story?source=gallery',
        })
    })

    it('preserves a filtered Work return route while switching between Work and Style Ups', () => {
        const state: SiteRouteSelectionState<{slug: string}> = {
            lastWorkRoute: '/',
            optimisticSection: null,
            projectRouteSelection: {
                project: null,
                notFound: false,
            },
        }

        const styleUpsNavigation = applySiteRouteSelectionEvent({
            state,
            event: {
                type: 'sectionNavigationStarted',
                section: 'style-ups',
                pathname: '/work/brand/brand-a',
                searchParams: new URLSearchParams(),
            },
        })

        expect(
            getSiteRouteSelectionView({
                state: styleUpsNavigation.state,
                pathname: '/style-ups',
                searchParams: new URLSearchParams(),
            }),
        ).toMatchObject({
            activeSection: 'style-ups',
            routeSection: 'style-ups',
            visibleWorkRoute: '/work/brand/brand-a',
            workRoute: '/work/brand/brand-a',
        })

        expect(
            applySiteRouteSelectionEvent({
                state: styleUpsNavigation.state,
                event: {
                    type: 'sectionNavigationStarted',
                    section: 'work',
                    pathname: '/style-ups',
                    searchParams: new URLSearchParams(),
                },
            }).view,
        ).toMatchObject({
            activeSection: 'work',
            routeSection: 'style-ups',
            visibleWorkRoute: '/work/brand/brand-a',
            workRoute: '/work/brand/brand-a',
        })
    })

    it('starts section navigation with remembered Work route and optimistic active section', () => {
        const selectedProject = {
            _id: 'project-1',
            slug: 'editorial-story',
        }
        const state: SiteRouteSelectionState<typeof selectedProject> = {
            lastWorkRoute: '/',
            optimisticSection: null,
            projectRouteSelection: {
                project: selectedProject,
                notFound: false,
            },
        }

        expect(
            applySiteRouteSelectionEvent({
                state,
                event: {
                    type: 'sectionNavigationStarted',
                    section: 'style-ups',
                    pathname: '/work/editorial-story',
                    searchParams: new URLSearchParams('source=gallery'),
                },
            }),
        ).toEqual({
            state: {
                lastWorkRoute: '/work/editorial-story?source=gallery',
                optimisticSection: {
                    section: 'style-ups',
                    pathname: '/work/editorial-story',
                },
                projectRouteSelection: {
                    project: selectedProject,
                    notFound: false,
                },
            },
            view: {
                activeProject: selectedProject,
                activeSection: 'style-ups',
                currentRoute: '/work/editorial-story?source=gallery',
                hasRouteProjectSelection: true,
                isProjectDetail: true,
                nextLastWorkRoute: '/work/editorial-story?source=gallery',
                routeProjectNotFound: false,
                routeSection: 'work',
                selectedProjectSlug: 'editorial-story',
                visibleWorkRoute: '/work/editorial-story?source=gallery',
                workRoute: '/work/editorial-story?source=gallery',
            },
        })
    })

    it('keeps stale loaded project state visible for cleanup after leaving a project route', () => {
        const selectedProject = {
            _id: 'project-1',
            slug: 'editorial-story',
        }
        const state: SiteRouteSelectionState<typeof selectedProject> = {
            lastWorkRoute: '/',
            optimisticSection: null,
            projectRouteSelection: {
                project: selectedProject,
                notFound: false,
            },
        }

        expect(
            getSiteRouteSelectionView({
                state,
                pathname: '/',
                searchParams: new URLSearchParams(),
            }),
        ).toMatchObject({
            activeProject: null,
            hasRouteProjectSelection: true,
            isProjectDetail: false,
            routeProjectNotFound: false,
        })
    })
})
