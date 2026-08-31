import {describe, expect, it} from 'vitest'
import {
    buildWorkIndex,
    createWorkIndexCatalog,
    getWorkIndexHref,
    getWorkIndexTitle,
    parseWorkIndexPath,
    toggleWorkIndex,
} from './workIndex'

describe('createWorkIndexCatalog', () => {
    it('exposes visible Work index groups from the sidebar filter payload', () => {
        const catalog = createWorkIndexCatalog({
            featuredCount: 2,
            allCount: 4,
            projectTypes: [
                {_id: 'editorial', title: 'Editorial', slug: 'editorial', referenceCount: 3},
                {_id: 'empty', title: 'Empty', slug: 'empty', referenceCount: 0},
                {_id: 'missing-title', title: '', slug: 'missing-title', referenceCount: 1},
                {_id: 'missing-slug', title: 'Missing slug', slug: null, referenceCount: 1},
            ],
            personalities: [{_id: 'stylist', title: 'Stylist', slug: 'stylist', referenceCount: 1}],
            brands: [{_id: 'brand-a', title: 'Brand A', slug: 'brand-a', referenceCount: 2}],
            settings: {
                showPersonalities: true,
                showBrands: true,
            },
        })

        expect(catalog.filters).toEqual({
            projectTypes: [
                {
                    id: 'featured',
                    title: 'Featured',
                    count: 2,
                    filter: {type: 'featured'},
                },
                {
                    id: 'all',
                    title: 'All',
                    count: 4,
                    filter: {type: 'all'},
                },
                {
                    id: 'editorial',
                    title: 'Editorial',
                    count: 3,
                    filter: {type: 'projectType', id: 'editorial'},
                },
            ],
            collaborators: [
                {
                    id: 'personality',
                    title: 'Personalities',
                    filterType: 'personality',
                    options: [
                        {
                            id: 'stylist',
                            title: 'Stylist',
                            count: 1,
                            filter: {type: 'personality', id: 'stylist'},
                        },
                    ],
                },
                {
                    id: 'brands',
                    title: 'Brands',
                    filterType: 'brand',
                    options: [
                        {
                            id: 'brand-a',
                            title: 'Brand A',
                            count: 2,
                            filter: {type: 'brand', id: 'brand-a'},
                        },
                    ],
                },
            ],
        })
    })

    it('uses one enabled-filter policy for visible groups and route parsing', () => {
        const catalog = createWorkIndexCatalog({
            featuredCount: 1,
            allCount: 3,
            projectTypes: [
                {_id: 'editorial', title: 'Editorial', slug: 'editorial', referenceCount: 2},
            ],
            personalities: [{_id: 'stylist', title: 'Stylist', slug: 'stylist', referenceCount: 1}],
            brands: [{_id: 'brand-a', title: 'Brand A', slug: 'brand-a', referenceCount: 1}],
            settings: {
                showPersonalities: false,
                showBrands: false,
            },
        })

        expect(catalog.filters.collaborators).toEqual([])
        expect(catalog.parsePath('/work/brand/brand-a')).toEqual({
            type: 'featured',
        })
        expect(catalog.parsePath('/work/personality/stylist')).toEqual({
            type: 'featured',
        })
        expect(catalog.parsePath('/work/type/editorial')).toEqual({
            type: 'projectType',
            id: 'editorial',
        })
    })

    it('creates route hrefs and toggles filters through the catalog', () => {
        const catalog = createWorkIndexCatalog({
            featuredCount: 1,
            allCount: 3,
            projectTypes: [
                {_id: 'editorial', title: 'Editorial', slug: 'editorial', referenceCount: 2},
            ],
            personalities: [{_id: 'stylist', title: 'Stylist', slug: 'stylist', referenceCount: 1}],
            brands: [{_id: 'brand-a', title: 'Brand A', slug: 'brand-a', referenceCount: 1}],
            settings: {
                showPersonalities: true,
                showBrands: true,
            },
        })

        expect(catalog.getHref({type: 'featured'})).toBe('/')
        expect(catalog.getHref({type: 'all'})).toBe('/work/all')
        expect(catalog.getHref({type: 'projectType', id: 'editorial'})).toBe('/work/type/editorial')
        expect(catalog.getHref({type: 'personality', id: 'stylist'})).toBe(
            '/work/personality/stylist',
        )

        expect(
            catalog.toggleFilter(
                {type: 'personality', id: 'stylist'},
                {type: 'personality', id: 'stylist'},
            ),
        ).toEqual({type: 'featured'})
    })
})

describe('buildWorkIndex', () => {
    it('builds visible project filters with featured and all before project types', () => {
        const index = buildWorkIndex({
            featuredCount: 2,
            allCount: 4,
            projectTypes: [
                {_id: 'editorial', title: 'Editorial', slug: 'editorial', referenceCount: 3},
                {_id: 'empty', title: 'Empty', slug: 'empty', referenceCount: 0},
                {_id: 'missing-slug', title: 'Missing slug', slug: null, referenceCount: 1},
            ],
            personalities: [],
            brands: [],
            settings: {
                showPersonalities: true,
                showBrands: true,
            },
        })

        expect(index.projectTypes).toEqual([
            {
                id: 'featured',
                title: 'Featured',
                count: 2,
                filter: {type: 'featured'},
            },
            {
                id: 'all',
                title: 'All',
                count: 4,
                filter: {type: 'all'},
            },
            {
                id: 'editorial',
                title: 'Editorial',
                count: 3,
                filter: {type: 'projectType', id: 'editorial'},
            },
        ])
    })

    it('builds collaborator groups only when enabled and containing visible options', () => {
        const index = buildWorkIndex({
            featuredCount: 0,
            allCount: 0,
            projectTypes: [],
            personalities: [{_id: 'stylist', title: 'Stylist', slug: 'stylist', referenceCount: 1}],
            brands: [
                {
                    _id: 'hidden-brand',
                    title: 'Hidden Brand',
                    slug: 'hidden-brand',
                    referenceCount: 4,
                },
            ],
            settings: {
                showPersonalities: true,
                showBrands: false,
            },
        })

        expect(index.collaborators).toEqual([
            {
                id: 'personality',
                title: 'Personalities',
                filterType: 'personality',
                options: [
                    {
                        id: 'stylist',
                        title: 'Stylist',
                        count: 1,
                        filter: {type: 'personality', id: 'stylist'},
                    },
                ],
            },
        ])
    })
})

describe('toggleWorkIndex', () => {
    it('selects a filter and resets to featured when selecting the active specific filter', () => {
        expect(toggleWorkIndex({type: 'featured'}, {type: 'projectType', id: 'editorial'})).toEqual(
            {type: 'projectType', id: 'editorial'},
        )

        expect(
            toggleWorkIndex(
                {type: 'projectType', id: 'editorial'},
                {type: 'projectType', id: 'editorial'},
            ),
        ).toEqual({type: 'featured'})

        expect(toggleWorkIndex({type: 'projectType', id: 'editorial'}, {type: 'all'})).toEqual({
            type: 'all',
        })
    })
})

describe('work index routes', () => {
    const sidebarFilters = {
        featuredCount: 1,
        allCount: 3,
        projectTypes: [
            {_id: 'editorial', title: 'Editorial', slug: 'editorial', referenceCount: 2},
        ],
        personalities: [{_id: 'stylist', title: 'Stylist', slug: 'stylist', referenceCount: 1}],
        brands: [{_id: 'brand-a', title: 'Brand A', slug: 'brand-a', referenceCount: 1}],
        settings: {
            showPersonalities: true,
            showBrands: true,
        },
    }

    it('parses page-like Work collection paths', () => {
        expect(parseWorkIndexPath('/', sidebarFilters)).toEqual({type: 'featured'})
        expect(parseWorkIndexPath('/work/all', sidebarFilters)).toEqual({type: 'all'})
        expect(parseWorkIndexPath('/work/type/editorial', sidebarFilters)).toEqual({
            type: 'projectType',
            id: 'editorial',
        })
        expect(parseWorkIndexPath('/work/brand/brand-a', sidebarFilters)).toEqual({
            type: 'brand',
            id: 'brand-a',
        })
        expect(parseWorkIndexPath('/work/personality/stylist', sidebarFilters)).toEqual({
            type: 'personality',
            id: 'stylist',
        })
        expect(parseWorkIndexPath('/work/unknown-project', sidebarFilters)).toEqual({
            type: 'featured',
        })
    })

    it('creates page-like Work collection hrefs', () => {
        expect(getWorkIndexHref({type: 'featured'}, sidebarFilters)).toBe('/')
        expect(getWorkIndexHref({type: 'all'}, sidebarFilters)).toBe('/work/all')
        expect(getWorkIndexHref({type: 'projectType', id: 'editorial'}, sidebarFilters)).toBe(
            '/work/type/editorial',
        )
        expect(getWorkIndexHref({type: 'brand', id: 'brand-a'}, sidebarFilters)).toBe(
            '/work/brand/brand-a',
        )
        expect(getWorkIndexHref({type: 'personality', id: 'stylist'}, sidebarFilters)).toBe(
            '/work/personality/stylist',
        )
        expect(getWorkIndexHref({type: 'brand', id: 'missing'}, sidebarFilters)).toBe('/')
    })

    it('resolves page-like Work collection titles', () => {
        expect(getWorkIndexTitle({type: 'featured'}, sidebarFilters)).toBe('Featured')
        expect(getWorkIndexTitle({type: 'all'}, sidebarFilters)).toBe('All')
        expect(getWorkIndexTitle({type: 'projectType', id: 'editorial'}, sidebarFilters)).toBe(
            'Editorial',
        )
        expect(getWorkIndexTitle({type: 'brand', id: 'brand-a'}, sidebarFilters)).toBe('Brand A')
        expect(getWorkIndexTitle({type: 'personality', id: 'stylist'}, sidebarFilters)).toBe(
            'Stylist',
        )
        expect(getWorkIndexTitle({type: 'brand', id: 'missing'}, sidebarFilters)).toBeNull()
    })
})
