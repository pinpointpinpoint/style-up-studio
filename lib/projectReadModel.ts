import {featuredProjectsQuery, projectBySlugQuery, projectsQuery} from '../sanity/lib/queries'
import type {
    FeaturedProjectsQueryResult,
    ProjectBySlugQueryResult,
    ProjectsQueryResult,
} from '@/sanity.types'
import type {Filter, Project, ProjectsQueryInput} from '@/types'
import {DEFAULT_PROJECT_FILTER} from './projectFilters'

const DEFAULT_LIMIT = 2

export type ProjectReadFetchArgs = {
    query: string
    stega: false
    params?: Record<string, unknown>
    tags?: string[]
}

export type ProjectReadFetch = <T>(args: ProjectReadFetchArgs) => Promise<{data: T}>

type ProjectReadModelDependencies = {
    sanityFetch: ProjectReadFetch
}

type RawProject =
    | ProjectsQueryResult[number]
    | FeaturedProjectsQueryResult[number]
    | ProjectBySlugQueryResult

function normalizeFilter(filter?: Partial<Filter> | null): Filter {
    return filter?.type ? (filter as Filter) : DEFAULT_PROJECT_FILTER
}

function normalizeProject(project: RawProject): Project | null {
    if (!project) return null

    return {
        ...project,
        featured: project.featured ?? false,
        projectType: project.projectType ?? [],
        personalities: project.personalities ?? [],
        brands: project.brands ?? [],
        media: project.media ?? [],
        description: project.description ?? [],
        credits: project.credits ?? [],
    }
}

export function createProjectReadModel({sanityFetch}: ProjectReadModelDependencies) {
    return {
        async getProjects(input: ProjectsQueryInput): Promise<Project[]> {
            const filter = normalizeFilter(input.filter)
            const cursor = input.cursor ?? null
            const useFeaturedOrder = filter.type === 'featured'
            const query = useFeaturedOrder ? featuredProjectsQuery : projectsQuery
            const limit = input.limit ?? DEFAULT_LIMIT

            const {data} = await sanityFetch<ProjectsQueryResult | FeaturedProjectsQueryResult>({
                query,
                stega: false,
                params: {
                    filterType: filter.type,
                    filterId: 'id' in filter ? filter.id : '',
                    cursorOrderRank:
                        cursor?.type === 'featured' ? (cursor.orderRank ?? null) : null,
                    cursorDate: cursor?.type === 'date' ? (cursor.date ?? null) : null,
                    cursorId: cursor?.id ?? '',
                    limit,
                },
            })

            return data
                .map((project) => normalizeProject(project))
                .filter((project): project is Project => Boolean(project))
        },
        async getProjectBySlug(slug: string): Promise<Project | null> {
            const {data} = await sanityFetch<ProjectBySlugQueryResult>({
                query: projectBySlugQuery,
                stega: false,
                params: {slug},
            })

            return normalizeProject(data)
        },
    }
}
