import {Suspense} from 'react'
import {headers} from 'next/headers'
import {getProjects, getStyleUps} from './actions'
import {createWorkIndexCatalog} from '@/features/work/lib/workIndex'
import {PROJECTS_PAGE_SIZE} from '@/features/work/lib/constants'
import SiteSectionsAccordion from '@/features/site-shell/components/SiteSectionsAccordion/SiteSectionsAccordion'
import {sanityFetch} from '@/sanity/lib/fetch'
import {getSiteShellData} from '@/features/site-shell/services/getSiteShellData'
import {
    createSiteMetadataService,
    type SiteMetadataServiceFetchArgs,
} from '@/features/site-shell/services/siteMetadataService'
import type {Metadata, Viewport} from 'next'
import {SpeedInsights} from '@vercel/speed-insights/next'
import Navbar from '@/features/site-shell/components/Navbar/Navbar'
import {SiteRouteSelectionProvider} from '@/features/site-shell/routing/SiteRouteSelectionProvider'
import SiteConsoleCredits from '@/features/site-shell/components/SiteConsoleCredits/SiteConsoleCredits'
import IntroGate from '@/features/site-shell/components/IntroGate/IntroGate'

const siteMetadataService = createSiteMetadataService({
    sanityFetch: ((args) => sanityFetch(args)) as <T>(
        args: SiteMetadataServiceFetchArgs,
    ) => Promise<{data: T}>,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
})

export async function generateMetadata(): Promise<Metadata> {
    return siteMetadataService.getMetadata()
}

export const viewport: Viewport = {
    themeColor: [
        {media: '(prefers-color-scheme: light)', color: '#ffffff'},
        {media: '(prefers-color-scheme: dark)', color: 'var(--off-black)'},
    ],
}

export default async function IndexRoute({children}: {children: React.ReactNode}) {
    const {about, contact, sidebarFilters} = await getSiteShellData()
    const pathname = (await headers()).get('x-site-pathname') ?? '/'
    const initialFilter = createWorkIndexCatalog(sidebarFilters).parsePath(pathname)
    const [initialProjects, initialStyleUps] = await Promise.all([
        getProjects({filter: initialFilter, limit: PROJECTS_PAGE_SIZE}),
        getStyleUps(),
    ])

    return (
                <Suspense fallback={null}>
                <div className="site">
                      <SiteRouteSelectionProvider>
                        <Navbar about={about} contact={contact} />
                        <SiteSectionsAccordion initialProjects={initialProjects}
                            initialFilter={initialFilter} initialStyleUps={initialStyleUps}
                            sidebarFilters={sidebarFilters}>
                            {children}
                        </SiteSectionsAccordion>
                      </SiteRouteSelectionProvider>
                </div>
                <SiteConsoleCredits />
                <SpeedInsights />
                </Suspense>
    )
}
