import {describe, expect, it} from 'vitest'
import type {Project} from '@/types'
import {
    appendLoadedProjects,
    createWorkBrowsingSessionState,
    getProjectDetailCloseNavigation,
    getProjectGalleryReturnUrl,
    getWorkFilterNavigationHref,
    getLoadMoreProjectsInput,
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
})
