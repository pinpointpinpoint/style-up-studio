import {describe, expect, it} from 'vitest'
import {
    SANITY_PROJECTS_TAG,
    SANITY_PUBLIC_TAG,
    SANITY_SITE_SHELL_TAG,
    SANITY_STYLE_UPS_TAG,
} from '../../../sanity/lib/cacheTags'
import type {Project, ProjectsQueryInput} from '@/types'
import {createGetSiteInitialData, type SiteInitialDataFetchArgs} from './getSiteInitialData'

describe('get site initial data', () => {
    it('loads the public site shell data and initial Work projects', async () => {
        const fetchRequests: SiteInitialDataFetchArgs[] = []
        const projectRequests: ProjectsQueryInput[] = []
        const project = {
            _id: 'project-1',
            _type: 'project',
            title: 'Editorial Story',
            client: 'Style Up',
            date: '2026-01-01',
            slug: 'editorial-story',
            projectType: [],
            featured: true,
            personalities: [],
            brands: [],
            media: [],
            previewUrl: null,
            coverImage: null,
            description: [],
            credits: [],
            orderRank: null,
        } satisfies Project
        const getSiteInitialData = createGetSiteInitialData({
            sanityFetch: async <T>(args: SiteInitialDataFetchArgs) => {
                fetchRequests.push(args)

                if (args.name === 'about') return {data: {bio: []} as T}
                if (args.name === 'contact') return {data: {email: 'hello@example.com'} as T}
                if (args.name === 'sidebarFilters') {
                    return {
                        data: {
                            featuredCount: 1,
                            allCount: 1,
                            projectTypes: [],
                            personalities: [],
                            brands: [],
                            settings: {showPersonalities: true, showBrands: true},
                        } as T,
                    }
                }
                if (args.name === 'styleUps') return {data: [{_id: 'style-up-1'}] as T}

                throw new Error(`Unexpected read: ${args.name}`)
            },
            getProjects: async (input) => {
                projectRequests.push(input)
                return [project]
            },
        })

        await expect(getSiteInitialData()).resolves.toMatchObject({
            about: {bio: []},
            contact: {email: 'hello@example.com'},
            sidebarFilters: {
                featuredCount: 1,
                allCount: 1,
            },
            styleUps: [{_id: 'style-up-1'}],
            initialProjects: [project],
            initialFilter: {type: 'featured'},
        })
        expect(fetchRequests.map((request) => request.name)).toEqual([
            'about',
            'contact',
            'sidebarFilters',
            'styleUps',
        ])
        expect(fetchRequests.map((request) => ({name: request.name, tags: request.tags}))).toEqual([
            {
                name: 'about',
                tags: [SANITY_PUBLIC_TAG, SANITY_SITE_SHELL_TAG],
            },
            {
                name: 'contact',
                tags: [SANITY_PUBLIC_TAG, SANITY_SITE_SHELL_TAG],
            },
            {
                name: 'sidebarFilters',
                tags: [SANITY_PUBLIC_TAG, SANITY_SITE_SHELL_TAG, SANITY_PROJECTS_TAG],
            },
            {
                name: 'styleUps',
                tags: [SANITY_PUBLIC_TAG, SANITY_STYLE_UPS_TAG],
            },
        ])
        expect(projectRequests).toEqual([{filter: {type: 'featured'}, limit: 19}])
    })
})
