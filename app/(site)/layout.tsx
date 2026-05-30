import '@/styles/index.css'
import {Suspense} from 'react'
import {sanityFetch} from '@/sanity/lib/fetch'
import {getProjects} from './actions'
import {
    createSiteShellService,
    type SiteShellServiceFetchArgs,
} from '@/features/site-shell/services/siteShellService'
import {
    createSiteMetadataService,
    type SiteMetadataServiceFetchArgs,
} from '@/features/site-shell/services/siteMetadataService'
import type {Metadata, Viewport} from 'next'
import {SpeedInsights} from '@vercel/speed-insights/next'
import {Toaster} from 'sonner'
import IntroGate from '@/features/site-shell/components/IntroGate/IntroGate'
import SiteSectionsAccordion from '@/features/site-shell/components/SiteSectionsAccordion/SiteSectionsAccordion'
import Navbar from '@/features/site-shell/components/Navbar/Navbar'
import EasterEgg from '@/features/site-shell/components/EasterEgg/EasterEgg'
import SiteConsoleCredits from '@/features/site-shell/components/SiteConsoleCredits/SiteConsoleCredits'
import type {StyleUpItem} from '@/features/style-ups/components/StyleUps/StyleUps'

const siteShellService = createSiteShellService({
    sanityFetch: ((args) => sanityFetch(args)) as <T>(
        args: SiteShellServiceFetchArgs,
    ) => Promise<{data: T}>,
    getProjects,
})

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
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default async function IndexRoute({children}: {children: React.ReactNode}) {
    const {about, contact, sidebarFilters, styleUps, initialProjects, initialFilter} =
        await siteShellService.getInitialData()

    return (
        <>
            <IntroGate>
                <div className="site">
                    <Navbar about={about} contact={contact} />
                    <Suspense fallback={null}>
                        <SiteSectionsAccordion
                            initialProjects={initialProjects}
                            initialFilter={initialFilter}
                            sidebarFilters={sidebarFilters}
                            styleUps={styleUps as StyleUpItem[]}
                        >
                            {children}
                        </SiteSectionsAccordion>
                    </Suspense>
                </div>
                <EasterEgg />
                <SiteConsoleCredits />
                <Toaster />
                <SpeedInsights />
            </IntroGate>
        </>
    )
}
