import type {About, Contact, SidebarFiltersQueryResult} from '@/sanity.types'
import {
    SANITY_PROJECTS_TAG,
    SANITY_PUBLIC_TAG,
    SANITY_SITE_SHELL_TAG,
} from '../../../sanity/lib/cacheTags'
import type {Project, ProjectsQueryInput} from '@/types'
import {
    aboutSectionQuery,
    contactSectionQuery,
    sidebarFiltersQuery,
} from '../../../sanity/lib/queries'
import {DEFAULT_PROJECT_FILTER} from '../../work/lib/projectFilters'
import {PROJECTS_PAGE_SIZE} from '../../work/lib/constants'

type SiteShellReadName = 'about' | 'contact' | 'sidebarFilters'

export type SiteShellServiceFetchArgs = {
    name: SiteShellReadName
    query: string
    stega: false
    tags?: string[]
}

export type SiteShellServiceFetch = <T>(args: SiteShellServiceFetchArgs) => Promise<{data: T}>

type SiteShellServiceDependencies = {
    sanityFetch: SiteShellServiceFetch
    getProjects(input: ProjectsQueryInput): Promise<Project[]>
}

export type SiteShellData = {
    about: Pick<About, 'bio' | 'image'> | null
    contact: Pick<Contact, 'email' | 'instagram'> | null
    sidebarFilters: SidebarFiltersQueryResult
    initialProjects: Project[]
    initialFilter: typeof DEFAULT_PROJECT_FILTER
}

export function createSiteShellService({sanityFetch, getProjects}: SiteShellServiceDependencies) {
    return {
        async getInitialData(): Promise<SiteShellData> {
            const [{data: about}, {data: contact}, {data: sidebarFilters}, initialProjects] =
                await Promise.all([
                    sanityFetch<Pick<About, 'bio' | 'image'> | null>({
                        name: 'about',
                        query: aboutSectionQuery,
                        stega: false,
                        tags: [SANITY_PUBLIC_TAG, SANITY_SITE_SHELL_TAG],
                    }),
                    sanityFetch<Pick<Contact, 'email' | 'instagram'> | null>({
                        name: 'contact',
                        query: contactSectionQuery,
                        stega: false,
                        tags: [SANITY_PUBLIC_TAG, SANITY_SITE_SHELL_TAG],
                    }),
                    sanityFetch<SidebarFiltersQueryResult>({
                        name: 'sidebarFilters',
                        query: sidebarFiltersQuery,
                        stega: false,
                        tags: [SANITY_PUBLIC_TAG, SANITY_SITE_SHELL_TAG, SANITY_PROJECTS_TAG],
                    }),
                    getProjects({
                        filter: DEFAULT_PROJECT_FILTER,
                        limit: PROJECTS_PAGE_SIZE,
                    }),
                ])

            return {
                about,
                contact,
                sidebarFilters,
                initialProjects,
                initialFilter: DEFAULT_PROJECT_FILTER,
            }
        },
    }
}
