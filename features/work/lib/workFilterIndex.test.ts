import {describe, expect, it} from 'vitest'
import {
    buildWorkFilterIndex,
    createWorkFilterCatalog,
    parseWorkFilter,
    toggleWorkFilter,
    writeWorkFilterToParams,
} from './workFilterIndex'

describe('createWorkFilterCatalog', () => {
    it('exposes visible Work filter groups from the sidebar filter payload', () => {
        const catalog = createWorkFilterCatalog({
            featuredCount: 2,
            allCount: 4,
            projectTypes: [
                {_id: 'editorial', title: 'Editorial', slug: 'editorial', referenceCount: 3},
                {_id: 'empty', title: 'Empty', slug: 'empty', referenceCount: 0},
                {_id: 'missing-title', title: '', slug: 'missing-title', referenceCount: 1},
                {_id: 'missing-slug', title: 'Missing slug', slug: null, referenceCount: 1},
            ],
            personalities: [
                {_id: 'stylist', title: 'Stylist', slug: 'stylist', referenceCount: 1},
            ],
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

    it('uses one enabled-filter policy for visible groups and URL parsing', () => {
        const catalog = createWorkFilterCatalog({
            featuredCount: 1,
            allCount: 3,
            projectTypes: [
                {_id: 'editorial', title: 'Editorial', slug: 'editorial', referenceCount: 2},
            ],
            personalities: [
                {_id: 'stylist', title: 'Stylist', slug: 'stylist', referenceCount: 1},
            ],
            brands: [{_id: 'brand-a', title: 'Brand A', slug: 'brand-a', referenceCount: 1}],
            settings: {
                showPersonalities: false,
                showBrands: false,
            },
        })

        expect(catalog.filters.collaborators).toEqual([])
        expect(catalog.parseFilter(new URLSearchParams('brand=brand-a'))).toEqual({
            type: 'featured',
        })
        expect(catalog.parseFilter(new URLSearchParams('personality=stylist'))).toEqual({
            type: 'featured',
        })
        expect(catalog.parseFilter(new URLSearchParams('projectType=editorial'))).toEqual({
            type: 'projectType',
            id: 'editorial',
        })
    })

    it('does not write disabled collaborator filters into URL params', () => {
        const catalog = createWorkFilterCatalog({
            featuredCount: 1,
            allCount: 3,
            projectTypes: [],
            personalities: [
                {_id: 'stylist', title: 'Stylist', slug: 'stylist', referenceCount: 1},
            ],
            brands: [{_id: 'brand-a', title: 'Brand A', slug: 'brand-a', referenceCount: 1}],
            settings: {
                showPersonalities: false,
                showBrands: false,
            },
        })

        expect(
            catalog
                .writeFilterToParams(
                    {type: 'brand', id: 'brand-a'},
                    new URLSearchParams('brand=brand-a&personality=stylist&page=2'),
                )
                .toString(),
        ).toBe('page=2')
    })

    it('serializes and toggles filters through the catalog', () => {
        const catalog = createWorkFilterCatalog({
            featuredCount: 1,
            allCount: 3,
            projectTypes: [
                {_id: 'editorial', title: 'Editorial', slug: 'editorial', referenceCount: 2},
            ],
            personalities: [
                {_id: 'stylist', title: 'Stylist', slug: 'stylist', referenceCount: 1},
            ],
            brands: [{_id: 'brand-a', title: 'Brand A', slug: 'brand-a', referenceCount: 1}],
            settings: {
                showPersonalities: true,
                showBrands: true,
            },
        })

        expect(
            catalog
                .writeFilterToParams(
                    {type: 'personality', id: 'stylist'},
                    new URLSearchParams('brand=brand-a&page=2'),
                )
                .toString(),
        ).toBe('page=2&personality=stylist')

        expect(
            catalog.toggleFilter(
                {type: 'personality', id: 'stylist'},
                {type: 'personality', id: 'stylist'},
            ),
        ).toEqual({type: 'featured'})
    })
})

describe('buildWorkFilterIndex', () => {
    it('builds visible project filters with featured and all before project types', () => {
        const index = buildWorkFilterIndex({
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
        const index = buildWorkFilterIndex({
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

describe('toggleWorkFilter', () => {
    it('selects a filter and resets to featured when selecting the active specific filter', () => {
        expect(
            toggleWorkFilter({type: 'featured'}, {type: 'projectType', id: 'editorial'}),
        ).toEqual({type: 'projectType', id: 'editorial'})

        expect(
            toggleWorkFilter(
                {type: 'projectType', id: 'editorial'},
                {type: 'projectType', id: 'editorial'},
            ),
        ).toEqual({type: 'featured'})

        expect(toggleWorkFilter({type: 'projectType', id: 'editorial'}, {type: 'all'})).toEqual({
            type: 'all',
        })
    })
})

describe('work filter URL params', () => {
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

    it('parses URL params using brand, personality, view, then project type priority', () => {
        expect(parseWorkFilter(new URLSearchParams('brand=brand-a'), sidebarFilters)).toEqual({
            type: 'brand',
            id: 'brand-a',
        })
        expect(parseWorkFilter(new URLSearchParams('personality=stylist'), sidebarFilters)).toEqual(
            {
                type: 'personality',
                id: 'stylist',
            },
        )
        expect(parseWorkFilter(new URLSearchParams('view=all'), sidebarFilters)).toEqual({
            type: 'all',
        })
        expect(
            parseWorkFilter(new URLSearchParams('projectType=editorial'), sidebarFilters),
        ).toEqual({
            type: 'projectType',
            id: 'editorial',
        })
    })

    it('serializes one active filter and removes stale filter params', () => {
        const params = writeWorkFilterToParams(
            {type: 'brand', id: 'brand-a'},
            sidebarFilters,
            new URLSearchParams('view=all&projectType=editorial&page=2'),
        )

        expect(params.toString()).toBe('page=2&brand=brand-a')
    })
})
