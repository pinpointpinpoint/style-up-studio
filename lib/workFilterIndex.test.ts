import {describe, expect, it} from 'vitest'
import {
    buildWorkFilterIndex,
    parseWorkFilter,
    toggleWorkFilter,
    writeWorkFilterToParams,
} from './workFilterIndex'

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
