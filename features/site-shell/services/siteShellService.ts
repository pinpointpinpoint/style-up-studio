import type {About, Contact, SidebarFiltersQueryResult} from '@/sanity.types'
import {
    aboutSectionQuery,
    contactSectionQuery,
    sidebarFiltersQuery,
} from '../../../sanity/lib/queries'

type SiteShellReadName = 'about' | 'contact' | 'sidebarFilters'

export type SiteShellServiceFetchArgs = {
    name: SiteShellReadName
    query: string
    stega: false
}

export type SiteShellServiceFetch = <T>(args: SiteShellServiceFetchArgs) => Promise<{data: T}>

type SiteShellServiceDependencies = {
    sanityFetch: SiteShellServiceFetch
}

export type SiteShellData = {
    about: Pick<About, 'bio' | 'image'> | null
    contact: Pick<Contact, 'email' | 'instagram'> | null
    sidebarFilters: SidebarFiltersQueryResult
}

export function createSiteShellService({sanityFetch}: SiteShellServiceDependencies) {
    return {
        async getInitialData(): Promise<SiteShellData> {
            const [{data: about}, {data: contact}, {data: sidebarFilters}] =
                await Promise.all([
                    sanityFetch<Pick<About, 'bio' | 'image'> | null>({
                        name: 'about',
                        query: aboutSectionQuery,
                        stega: false
                    }),
                    sanityFetch<Pick<Contact, 'email' | 'instagram'> | null>({
                        name: 'contact',
                        query: contactSectionQuery,
                        stega: false
                    }),
                    sanityFetch<SidebarFiltersQueryResult>({
                        name: 'sidebarFilters',
                        query: sidebarFiltersQuery,
                        stega: false
                    }),
                ])

            return {
                about,
                contact,
                sidebarFilters,
            }
        },
    }
}
