import {describe, expect, it} from 'vitest'
import type {Project} from '@/types'
import {
    appendLoadedProjects,
    applyWorkBrowsingPaginationResult,
    applyWorkBrowsingPaginationStart,
    applyWorkFilterRoute,
    createWorkBrowsingSessionState,
    applyWorkFilterChange,
    getProjectDetailCloseNavigation,
    getProjectGalleryOpenNavigation,
    getProjectGalleryReturnUrl,
    getProjectHref,
    getWorkFilterNavigationHref,
    getLoadMoreProjectsInput,
    getWorkBrowsingPaginationRequest,
} from './workBrowsingSession'

function project({
    id,
    date = '2026-01-01',
    orderRank = null,
}: {
    id: string
    date?: string | null
    orderRank?: string | null
}): Project {
    return {
        _id: id,
        _type: 'project',
        title: id,
        client: null,
        date,
        slug: id,
        projectType: [],
        featured: false,
        personalities: [],
        brands: [],
        media: [],
        previewUrl: null,
        coverImage: null,
        description: [],
        credits: [],
        orderRank,
    }
}

describe('work browsing session', () => {
    it('applies a cached filter change and returns the navigation href', () => {
        const featuredProject = project({id: 'featured-project'})
        const brandProject = project({id: 'brand-project'})
        const state = {
            ...createWorkBrowsingSessionState({
                initialProjects: [featuredProject],
                initialFilter: {type: 'featured'},
                isProjectsLoading: false,
                pageSize: 2,
            }),
            hoveredProject: featuredProject,
        }
        const sidebarFilters = {
            featuredCount: 1,
            allCount: 2,
            projectTypes: [],
            personalities: [],
            brands: [{_id: 'brand-a', title: 'Brand A', slug: 'brand-a', referenceCount: 1}],
            settings: {
                showPersonalities: true,
                showBrands: true,
            },
        }

        expect(
            applyWorkFilterChange({
                state,
                nextFilter: {type: 'brand', id: 'brand-a'},
                cachedProjectPages: new Map([
                    [
                        JSON.stringify({type: 'brand', id: 'brand-a'}),
                        {
                            visibleProjects: [brandProject],
                            hasMore: false,
                        },
                    ],
                ]),
                sidebarFilters,
                searchParams: new URLSearchParams('view=all&page=2'),
                pathname: '/',
            }),
        ).toEqual({
            state: {
                ...state,
                filter: {type: 'brand', id: 'brand-a'},
                visibleProjects: [brandProject],
                hasMore: false,
                hoveredProject: null,
                isLoading: false,
            },
            href: '/?page=2&brand=brand-a',
            filterKey: JSON.stringify({type: 'brand', id: 'brand-a'}),
            didUseCachedProjectPage: true,
        })
    })

    it('applies an uncached gallery route filter while preserving the current projects', () => {
        const featuredProject = project({id: 'featured-project'})
        const state = {
            ...createWorkBrowsingSessionState({
                initialProjects: [featuredProject],
                initialFilter: {type: 'featured'},
                isProjectsLoading: false,
                pageSize: 2,
            }),
            hoveredProject: featuredProject,
        }
        const sidebarFilters = {
            featuredCount: 1,
            allCount: 2,
            projectTypes: [],
            personalities: [],
            brands: [{_id: 'brand-a', title: 'Brand A', slug: 'brand-a', referenceCount: 1}],
            settings: {
                showPersonalities: true,
                showBrands: true,
            },
        }

        expect(
            applyWorkFilterRoute({
                state,
                pathname: '/',
                searchParams: new URLSearchParams('brand=brand-a'),
                sidebarFilters,
                cachedProjectPages: new Map(),
            }),
        ).toEqual({
            state: {
                ...state,
                filter: {type: 'brand', id: 'brand-a'},
                hoveredProject: null,
            },
            filterKey: JSON.stringify({type: 'brand', id: 'brand-a'}),
            didChangeFilter: true,
            didUseCachedProjectPage: false,
        })
    })

    it('leaves the session unchanged when the gallery route filter is already active', () => {
        const featuredProject = project({id: 'featured-project'})
        const state = createWorkBrowsingSessionState({
            initialProjects: [featuredProject],
            initialFilter: {type: 'featured'},
            isProjectsLoading: false,
            pageSize: 2,
        })

        expect(
            applyWorkFilterRoute({
                state,
                pathname: '/',
                searchParams: new URLSearchParams(),
                sidebarFilters: {
                    featuredCount: 1,
                    allCount: 1,
                    projectTypes: [],
                    personalities: [],
                    brands: [],
                    settings: {
                        showPersonalities: true,
                        showBrands: true,
                    },
                },
                cachedProjectPages: new Map(),
            }),
        ).toEqual({
            state,
            filterKey: JSON.stringify({type: 'featured'}),
            didChangeFilter: false,
            didUseCachedProjectPage: false,
        })
    })

    it('creates load-more input from the visible projects and appends the loaded page', () => {
        const state = createWorkBrowsingSessionState({
            initialProjects: [
                project({id: 'project-a', orderRank: 'a'}),
                project({id: 'project-b', orderRank: 'b'}),
            ],
            initialFilter: {type: 'featured'},
            isProjectsLoading: false,
            pageSize: 2,
        })

        expect(getLoadMoreProjectsInput(state)).toEqual({
            filter: {type: 'featured'},
            cursor: {
                type: 'featured',
                orderRank: 'b',
                id: 'project-b',
            },
            limit: 2,
        })

        expect(appendLoadedProjects(state, [project({id: 'project-c', orderRank: 'c'})])).toEqual(
            {
                ...state,
                visibleProjects: [
                    project({id: 'project-a', orderRank: 'a'}),
                    project({id: 'project-b', orderRank: 'b'}),
                    project({id: 'project-c', orderRank: 'c'}),
                ],
                hasMore: false,
                isLoading: false,
            },
        )
    })

    it('creates a featured pagination request and applies the loaded page cache update', () => {
        const state = createWorkBrowsingSessionState({
            initialProjects: [
                project({id: 'project-a', orderRank: 'a'}),
                project({id: 'project-b', orderRank: 'b'}),
            ],
            initialFilter: {type: 'featured'},
            isProjectsLoading: false,
            pageSize: 2,
        })

        expect(getWorkBrowsingPaginationRequest(state)).toEqual({
            input: {
                filter: {type: 'featured'},
                cursor: {
                    type: 'featured',
                    orderRank: 'b',
                    id: 'project-b',
                },
                limit: 2,
            },
            filterKey: JSON.stringify({type: 'featured'}),
        })

        expect(
            applyWorkBrowsingPaginationResult({
                state,
                nextProjects: [project({id: 'project-c', orderRank: 'c'})],
            }),
        ).toEqual({
            state: {
                ...state,
                visibleProjects: [
                    project({id: 'project-a', orderRank: 'a'}),
                    project({id: 'project-b', orderRank: 'b'}),
                    project({id: 'project-c', orderRank: 'c'}),
                ],
                hasMore: false,
                isLoading: false,
            },
            cacheKey: JSON.stringify({type: 'featured'}),
            cachedProjectPage: {
                visibleProjects: [
                    project({id: 'project-a', orderRank: 'a'}),
                    project({id: 'project-b', orderRank: 'b'}),
                    project({id: 'project-c', orderRank: 'c'}),
                ],
                hasMore: false,
            },
        })
    })

    it('does not create a pagination request while loading or after the filter is exhausted', () => {
        const state = createWorkBrowsingSessionState({
            initialProjects: [project({id: 'project-a'})],
            initialFilter: {type: 'featured'},
            isProjectsLoading: false,
            pageSize: 2,
        })

        expect(getWorkBrowsingPaginationRequest({...state, isLoading: true})).toBeNull()
        expect(getWorkBrowsingPaginationRequest({...state, hasMore: false})).toBeNull()
    })

    it('marks pagination as loading through the session interface', () => {
        const state = createWorkBrowsingSessionState({
            initialProjects: [project({id: 'project-a'})],
            initialFilter: {type: 'featured'},
            isProjectsLoading: false,
            pageSize: 2,
        })

        expect(applyWorkBrowsingPaginationStart(state)).toEqual({
            ...state,
            isLoading: true,
        })
    })

    it('creates a date cursor pagination request for non-featured filters', () => {
        const state = createWorkBrowsingSessionState({
            initialProjects: [
                project({id: 'project-a', date: '2026-02-01'}),
                project({id: 'project-b', date: '2026-01-01'}),
            ],
            initialFilter: {type: 'all'},
            isProjectsLoading: false,
            pageSize: 2,
        })

        expect(getWorkBrowsingPaginationRequest(state)).toEqual({
            input: {
                filter: {type: 'all'},
                cursor: {
                    type: 'date',
                    date: '2026-01-01',
                    id: 'project-b',
                },
                limit: 2,
            },
            filterKey: JSON.stringify({type: 'all'}),
        })
    })

    it('creates filter navigation URLs and project detail return navigation', () => {
        const sidebarFilters = {
            featuredCount: 1,
            allCount: 3,
            projectTypes: [
                {_id: 'editorial', title: 'Editorial', slug: 'editorial', referenceCount: 2},
            ],
            personalities: [],
            brands: [{_id: 'brand-a', title: 'Brand A', slug: 'brand-a', referenceCount: 1}],
            settings: {
                showPersonalities: true,
                showBrands: true,
            },
        }

        expect(
            getWorkFilterNavigationHref({
                filter: {type: 'brand', id: 'brand-a'},
                sidebarFilters,
                searchParams: new URLSearchParams('view=all&page=2'),
                pathname: '/',
            }),
        ).toBe('/?page=2&brand=brand-a')
        expect(getProjectGalleryReturnUrl('/', new URLSearchParams('projectType=editorial'))).toBe(
            '/?projectType=editorial',
        )
        expect(
            getProjectDetailCloseNavigation({
                savedReturnUrl: '/?view=all',
                canGoBackToSameOrigin: true,
            }),
        ).toEqual({
            type: 'push',
            href: '/?view=all',
            clearSavedReturnUrl: true,
        })
        expect(
            getProjectDetailCloseNavigation({
                savedReturnUrl: null,
                canGoBackToSameOrigin: true,
            }),
        ).toEqual({
            type: 'back',
            clearSavedReturnUrl: false,
        })
        expect(
            getProjectDetailCloseNavigation({
                savedReturnUrl: null,
                canGoBackToSameOrigin: false,
            }),
        ).toEqual({
            type: 'push',
            href: '/',
            clearSavedReturnUrl: false,
        })
    })

    it('creates the gallery return navigation for project open', () => {
        expect(
            getProjectGalleryOpenNavigation({
                pathname: '/',
                searchParams: new URLSearchParams('projectType=editorial'),
            }),
        ).toEqual({
            storageKey: 'projectGalleryReturnUrl',
            returnUrl: '/?projectType=editorial',
        })
    })

    it('creates project detail hrefs from project slugs', () => {
        expect(getProjectHref(project({id: 'project-a'}))).toBe('/work/project-a')
        expect(getProjectHref({...project({id: 'project-b'}), slug: null})).toBe('/')
    })
})
