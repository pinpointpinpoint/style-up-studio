import {describe, expect, it} from 'vitest'
import {SANITY_PROJECTS_TAG, SANITY_PUBLIC_TAG} from '../../../sanity/lib/cacheTags'
import {
    createProjectReadModel,
    type ProjectReadFetch,
    type ProjectReadFetchArgs,
} from './projectReadModel'

describe('project read model', () => {
    it('returns project lists as a stable site-level project shape', async () => {
        const sanityFetch: ProjectReadFetch = async <T>() => ({
            data: [
                {
                    _id: 'project-1',
                    _type: 'project',
                    title: 'Editorial Story',
                    client: 'Style Up',
                    date: '2026-01-01',
                    slug: 'editorial-story',
                    projectType: null,
                    featured: null,
                    personalities: null,
                    brands: null,
                    media: null,
                    previewUrl: null,
                    coverImage: null,
                    description: null,
                    credits: null,
                    orderRank: null,
                },
            ] as T,
        })
        const readModel = createProjectReadModel({
            sanityFetch,
        })

        await expect(
            readModel.getProjects({
                filter: {type: 'featured'},
                limit: 1,
            }),
        ).resolves.toEqual([
            {
                _id: 'project-1',
                _type: 'project',
                title: 'Editorial Story',
                client: 'Style Up',
                date: '2026-01-01',
                slug: 'editorial-story',
                projectType: [],
                featured: false,
                personalities: [],
                brands: [],
                media: [],
                previewUrl: null,
                coverImage: null,
                description: [],
                credits: [],
                orderRank: null,
            },
        ])
    })

    it('returns a stable project shape for a slug and null when missing', async () => {
        const requests: ProjectReadFetchArgs[] = []
        const sanityFetch: ProjectReadFetch = async <T>(request: ProjectReadFetchArgs) => {
            requests.push(request)

            return {
                data: (request.params?.slug === 'editorial-story'
                    ? {
                          _id: 'project-1',
                          _type: 'project',
                          title: 'Editorial Story',
                          client: 'Style Up',
                          date: '2026-01-01',
                          slug: 'editorial-story',
                          projectType: null,
                          featured: true,
                          personalities: null,
                          brands: null,
                          media: null,
                          previewUrl: null,
                          coverImage: null,
                          description: null,
                          credits: null,
                          orderRank: null,
                      }
                    : null) as T,
            }
        }
        const readModel = createProjectReadModel({
            sanityFetch,
        })

        await expect(readModel.getProjectBySlug('editorial-story')).resolves.toMatchObject({
            _id: 'project-1',
            slug: 'editorial-story',
            media: [],
            credits: [],
        })
        await expect(readModel.getProjectBySlug('missing-project')).resolves.toBeNull()
        expect(requests.map((request) => request.params)).toEqual([
            {slug: 'editorial-story'},
            {slug: 'missing-project'},
        ])
        expect(requests.map((request) => request.tags)).toEqual([
            [SANITY_PUBLIC_TAG, SANITY_PROJECTS_TAG],
            [SANITY_PUBLIC_TAG, SANITY_PROJECTS_TAG],
        ])
    })

    it('sends stable filter and cursor params when fetching project lists', async () => {
        const requests: ProjectReadFetchArgs[] = []
        const sanityFetch: ProjectReadFetch = async <T>(request: ProjectReadFetchArgs) => {
            requests.push(request)

            return {data: [] as T}
        }
        const readModel = createProjectReadModel({
            sanityFetch,
        })

        await readModel.getProjects({
            filter: {type: 'featured'},
            cursor: {type: 'featured', orderRank: 'a', id: 'project-a'},
            limit: 12,
        })
        await readModel.getProjects({
            filter: {type: 'brand', id: 'brand-a'},
            cursor: {type: 'date', date: '2026-01-01', id: 'project-b'},
            limit: 6,
        })

        expect(requests.map((request) => request.params)).toEqual([
            {
                filterType: 'featured',
                filterId: '',
                cursorOrderRank: 'a',
                cursorDate: null,
                cursorId: 'project-a',
                limit: 12,
            },
            {
                filterType: 'brand',
                filterId: 'brand-a',
                cursorOrderRank: null,
                cursorDate: '2026-01-01',
                cursorId: 'project-b',
                limit: 6,
            },
        ])
        expect(requests.map((request) => request.tags)).toEqual([
            [SANITY_PUBLIC_TAG, SANITY_PROJECTS_TAG],
            [SANITY_PUBLIC_TAG, SANITY_PROJECTS_TAG],
        ])
    })
})
