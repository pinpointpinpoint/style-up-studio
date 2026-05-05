import type {
    About,
    AllStyleUpsQueryResult,
    Contact,
    SidebarFiltersQueryResult,
} from '@/sanity.types'
import {
    SANITY_PROJECTS_TAG,
    SANITY_PUBLIC_TAG,
    SANITY_SITE_SHELL_TAG,
    SANITY_STYLE_UPS_TAG,
} from '../../../sanity/lib/cacheTags'
import type {Project, ProjectsQueryInput} from '@/types'
import {
    aboutSectionQuery,
    allStyleUpsQuery,
    contactSectionQuery,
    sidebarFiltersQuery,
} from '../../../sanity/lib/queries'
import {DEFAULT_PROJECT_FILTER} from '../../work/lib/projectFilters'
import {PROJECTS_PAGE_SIZE} from '../../work/lib/workBrowsingConfig'

type SiteInitialDataReadName = 'about' | 'contact' | 'sidebarFilters' | 'styleUps'

export type SiteInitialDataFetchArgs = {
    name: SiteInitialDataReadName
    query: string
    stega: false
    tags?: string[]
}

type SiteInitialDataFetch = <T>(args: SiteInitialDataFetchArgs) => Promise<{data: T}>

type SiteInitialDataGetterDependencies = {
    sanityFetch: SiteInitialDataFetch
    getProjects(input: ProjectsQueryInput): Promise<Project[]>
}

export type SiteInitialData = {
    about: Pick<About, 'bio' | 'image'> | null
    contact: Pick<Contact, 'email' | 'instagram'> | null
    sidebarFilters: SidebarFiltersQueryResult
    styleUps: AllStyleUpsQueryResult
    initialProjects: Project[]
    initialFilter: typeof DEFAULT_PROJECT_FILTER
}

export function createGetSiteInitialData({
    sanityFetch,
    getProjects,
}: SiteInitialDataGetterDependencies) {
    return async function getSiteInitialData(): Promise<SiteInitialData> {
        const [
            {data: about},
            {data: contact},
            {data: sidebarFilters},
            {data: styleUps},
            initialProjects,
        ] = await Promise.all([
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
            sanityFetch<AllStyleUpsQueryResult>({
                name: 'styleUps',
                query: allStyleUpsQuery,
                stega: false,
                tags: [SANITY_PUBLIC_TAG, SANITY_STYLE_UPS_TAG],
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
            styleUps,
            initialProjects,
            initialFilter: DEFAULT_PROJECT_FILTER,
        }
    }
}
