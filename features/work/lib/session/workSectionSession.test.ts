import {describe, expect, it} from 'vitest'
import type {Project} from '@/types'
import {
    appendLoadedProjects,
    applyWorkBrowsingEvent,
    applyWorkBrowsingPaginationResult,
    applyWorkBrowsingPaginationStart,
    applyWorkBrowsingRequestEnd,
    applyWorkBrowsingRefreshResult,
    applyWorkFilterRoute,
    createWorkSectionSessionState,
    applyWorkFilterChange,
    getProjectDetailCloseNavigation,
    getProjectGalleryOpenNavigation,
    getProjectGalleryReturnUrl,
    getProjectHref,
    getWorkFilterNavigationHref,
    getLoadMoreProjectsInput,
    getWorkBrowsingRefreshRequest,
    getWorkBrowsingPaginationRequest,
} from './workSectionSession'

const FEATURED_FILTER = {type: 'featured'} as const
const BRAND_A_FILTER = {type: 'brand', id: 'brand-a'} as const
const BRAND_B_FILTER = {type: 'brand', id: 'brand-b'} as const
const BRAND_A_FILTER_KEY = JSON.stringify(BRAND_A_FILTER)
const BRAND_B_FILTER_KEY = JSON.stringify(BRAND_B_FILTER)
const FEATURED_FILTER_KEY = JSON.stringify(FEATURED_FILTER)

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

function brandSidebarFilters() {
    return {
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
}

function createFeaturedState({
    hoveredProject,
    projects = [project({id: 'featured-project'})],
}: {
    hoveredProject?: Project | null
    projects?: Project[]
} = {}) {
    const state = createWorkSectionSessionState({
        initialProjects: projects,
        initialFilter: FEATURED_FILTER,
        isProjectsLoading: false,
        pageSize: 2,
    })

    return hoveredProject === undefined
        ? state
        : {
              ...state,
              hoveredProject,
          }
}

function cachedProjectPages(filterKey: string, visibleProjects: Project[], hasMore = false) {
    return new Map([
        [
            filterKey,
            {
                visibleProjects,
                hasMore,
            },
        ],
    ])
}

describe('work browsing session', () => {
    it('applies a cached filter change and returns the navigation href', () => {
        const featuredProject = project({id: 'featured-project'})
        const brandProject = project({id: 'brand-project'})
        const state = createFeaturedState({hoveredProject: featuredProject})

        expect(
            applyWorkFilterChange({
                state,
                nextFilter: BRAND_A_FILTER,
                cachedProjectPages: cachedProjectPages(BRAND_A_FILTER_KEY, [brandProject]),
                sidebarFilters: brandSidebarFilters(),
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
            filterKey: BRAND_A_FILTER_KEY,
            didUseCachedProjectPage: true,
        })
    })

    it('applies an uncached gallery route filter while preserving the current projects', () => {
        const featuredProject = project({id: 'featured-project'})
        const state = createFeaturedState({hoveredProject: featuredProject})

        expect(
            applyWorkFilterRoute({
                state,
                pathname: '/',
                searchParams: new URLSearchParams('brand=brand-a'),
                sidebarFilters: brandSidebarFilters(),
                cachedProjectPages: new Map(),
            }),
        ).toEqual({
            state: {
                ...state,
                filter: {type: 'brand', id: 'brand-a'},
                hoveredProject: null,
            },
            filterKey: BRAND_A_FILTER_KEY,
            didChangeFilter: true,
            didUseCachedProjectPage: false,
        })
    })

    it('applies an uncached filter change through one browsing event result', () => {
        const featuredProject = project({id: 'featured-project'})
        const state = createFeaturedState({hoveredProject: featuredProject})

        expect(
            applyWorkBrowsingEvent({
                state,
                event: {
                    type: 'filterChange',
                    nextFilter: BRAND_A_FILTER,
                },
                cachedProjectPages: new Map(),
                sidebarFilters: brandSidebarFilters(),
                searchParams: new URLSearchParams('view=all&page=2'),
                pathname: '/',
            }),
        ).toEqual({
            state: {
                ...state,
                filter: {type: 'brand', id: 'brand-a'},
                hoveredProject: null,
                isLoading: true,
            },
            navigation: {
                href: '/?page=2&brand=brand-a',
            },
            request: {
                filter: {type: 'brand', id: 'brand-a'},
                cursor: null,
                limit: 2,
            },
            filterKey: BRAND_A_FILTER_KEY,
            didUseCachedProjectPage: false,
        })
    })

    it('applies an uncached route filter through one browsing event result', () => {
        const featuredProject = project({id: 'featured-project'})
        const state = createFeaturedState({hoveredProject: featuredProject})

        expect(
            applyWorkBrowsingEvent({
                state,
                event: {
                    type: 'routeFilter',
                },
                cachedProjectPages: new Map(),
                sidebarFilters: brandSidebarFilters(),
                searchParams: new URLSearchParams('brand=brand-a'),
                pathname: '/',
            }),
        ).toEqual({
            state: {
                ...state,
                filter: {type: 'brand', id: 'brand-a'},
                hoveredProject: null,
                isLoading: true,
            },
            request: {
                filter: {type: 'brand', id: 'brand-a'},
                cursor: null,
                limit: 2,
            },
            filterKey: BRAND_A_FILTER_KEY,
            didChangeFilter: true,
            didUseCachedProjectPage: false,
        })
    })

    it('applies a cached filter change through one browsing event result', () => {
        const featuredProject = project({id: 'featured-project'})
        const brandProject = project({id: 'brand-project'})
        const state = createFeaturedState({hoveredProject: featuredProject})

        expect(
            applyWorkBrowsingEvent({
                state,
                event: {
                    type: 'filterChange',
                    nextFilter: BRAND_A_FILTER,
                },
                cachedProjectPages: cachedProjectPages(BRAND_A_FILTER_KEY, [brandProject]),
                sidebarFilters: brandSidebarFilters(),
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
            navigation: {
                href: '/?page=2&brand=brand-a',
            },
            request: null,
            filterKey: BRAND_A_FILTER_KEY,
            didUseCachedProjectPage: true,
        })
    })

    it('leaves the session unchanged when the gallery route filter is already active', () => {
        const state = createFeaturedState()

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
            filterKey: FEATURED_FILTER_KEY,
            didChangeFilter: false,
            didUseCachedProjectPage: false,
        })
    })

    it('creates load-more input from the visible projects and appends the loaded page', () => {
        const state = createWorkSectionSessionState({
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

        expect(appendLoadedProjects(state, [project({id: 'project-c', orderRank: 'c'})])).toEqual({
            ...state,
            visibleProjects: [
                project({id: 'project-a', orderRank: 'a'}),
                project({id: 'project-b', orderRank: 'b'}),
                project({id: 'project-c', orderRank: 'c'}),
            ],
            hasMore: false,
            isLoading: false,
        })
    })

    it('creates a featured pagination request and applies the loaded page cache update', () => {
        const state = createWorkSectionSessionState({
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

    it('starts load-more through one browsing event result', () => {
        const state = createFeaturedState({
            projects: [
                project({id: 'project-a', orderRank: 'a'}),
                project({id: 'project-b', orderRank: 'b'}),
            ],
        })

        expect(
            applyWorkBrowsingEvent({
                state,
                event: {
                    type: 'loadMore',
                },
                cachedProjectPages: new Map(),
                sidebarFilters: null,
                searchParams: new URLSearchParams(),
                pathname: '/',
            }),
        ).toEqual({
            state: {
                ...state,
                isLoading: true,
            },
            request: {
                filter: {type: 'featured'},
                cursor: {
                    type: 'featured',
                    orderRank: 'b',
                    id: 'project-b',
                },
                limit: 2,
            },
            filterKey: FEATURED_FILTER_KEY,
        })
    })

    it('does not create a pagination request while loading or after the filter is exhausted', () => {
        const state = createFeaturedState({projects: [project({id: 'project-a'})]})

        expect(getWorkBrowsingPaginationRequest({...state, isLoading: true})).toBeNull()
        expect(getWorkBrowsingPaginationRequest({...state, hasMore: false})).toBeNull()
    })

    it('marks pagination as loading through the session interface', () => {
        const state = createFeaturedState({projects: [project({id: 'project-a'})]})

        expect(applyWorkBrowsingPaginationStart(state)).toEqual({
            ...state,
            isLoading: true,
        })
    })

    it('creates a date cursor pagination request for non-featured filters', () => {
        const state = createWorkSectionSessionState({
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

    it('creates a refresh request only when the active filter page is missing from cache', () => {
        const state = createWorkSectionSessionState({
            initialProjects: [project({id: 'project-a'})],
            initialFilter: BRAND_A_FILTER,
            isProjectsLoading: false,
            pageSize: 2,
        })
        const cachedPages = cachedProjectPages(BRAND_A_FILTER_KEY, [project({id: 'project-a'})])

        expect(
            getWorkBrowsingRefreshRequest({
                state,
                cachedProjectPages: cachedPages,
            }),
        ).toBeNull()
        expect(
            getWorkBrowsingRefreshRequest({
                state: {
                    ...state,
                    filter: BRAND_B_FILTER,
                },
                cachedProjectPages: cachedPages,
            }),
        ).toEqual({
            input: {
                filter: BRAND_B_FILTER,
                cursor: null,
                limit: 2,
            },
            filterKey: BRAND_B_FILTER_KEY,
        })
    })

    it('applies refreshed projects and returns the active filter cache update', () => {
        const state = {
            ...createWorkSectionSessionState({
                initialProjects: [project({id: 'featured-project'})],
                initialFilter: BRAND_A_FILTER,
                isProjectsLoading: false,
                pageSize: 2,
            }),
            isLoading: true,
            hoveredProject: project({id: 'featured-project'}),
        }
        const nextProjects = [project({id: 'brand-project'})]

        expect(
            applyWorkBrowsingRefreshResult({
                state,
                nextProjects,
            }),
        ).toEqual({
            state: {
                ...state,
                visibleProjects: nextProjects,
                hasMore: false,
                hoveredProject: null,
                isLoading: false,
            },
            cacheKey: BRAND_A_FILTER_KEY,
            cachedProjectPage: {
                visibleProjects: nextProjects,
                hasMore: false,
            },
            didApply: true,
        })
    })

    it('ignores refreshed projects when the active filter has changed since the request started', () => {
        const state = {
            ...createWorkSectionSessionState({
                initialProjects: [project({id: 'featured-project'})],
                initialFilter: BRAND_B_FILTER,
                isProjectsLoading: false,
                pageSize: 2,
            }),
            isLoading: true,
        }

        expect(
            applyWorkBrowsingRefreshResult({
                state,
                filterKey: BRAND_A_FILTER_KEY,
                nextProjects: [project({id: 'stale-brand-project'})],
            }),
        ).toEqual({
            state,
            cacheKey: null,
            cachedProjectPage: null,
            didApply: false,
        })
    })

    it('ends a pending browsing request without changing the current projects', () => {
        const visibleProjects = [project({id: 'brand-project'})]
        const state = {
            ...createWorkSectionSessionState({
                initialProjects: visibleProjects,
                initialFilter: BRAND_A_FILTER,
                isProjectsLoading: false,
                pageSize: 2,
            }),
            isLoading: true,
        }

        expect(applyWorkBrowsingRequestEnd(state)).toEqual({
            ...state,
            isLoading: false,
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
                filter: BRAND_A_FILTER,
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

    it('closes a project detail route to the saved filtered gallery route', () => {
        expect(
            getProjectDetailCloseNavigation({
                savedReturnUrl: '/?brand=brand-a',
                canGoBackToSameOrigin: true,
            }),
        ).toEqual({
            type: 'push',
            href: '/?brand=brand-a',
            clearSavedReturnUrl: true,
        })
    })

    it('closes a direct project detail route through browser history when no gallery route is saved', () => {
        expect(
            getProjectDetailCloseNavigation({
                savedReturnUrl: null,
                canGoBackToSameOrigin: true,
            }),
        ).toEqual({
            type: 'back',
            clearSavedReturnUrl: false,
        })
    })

    it('closes an externally opened project detail route to the Work gallery fallback', () => {
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

    it('creates project detail hrefs from project slugs', () => {
        expect(getProjectHref(project({id: 'project-a'}))).toBe('/work/project-a')
        expect(getProjectHref({...project({id: 'project-b'}), slug: null})).toBe('/')
    })
})
