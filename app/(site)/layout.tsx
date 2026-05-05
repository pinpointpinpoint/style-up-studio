import '@/styles/index.css'
import {Suspense} from 'react'
import {sanityFetch} from '@/sanity/lib/fetch'
import {getProjects} from './actions'
import {
    createGetSiteInitialData,
    type SiteInitialDataFetchArgs,
} from '@/features/site-shell/lib/getSiteInitialData'
import {
    createGetSiteMetadata,
    type SiteMetadataFetchArgs,
} from '@/features/site-shell/lib/getSiteMetadata'
import type {Metadata, Viewport} from 'next'
import {SpeedInsights} from '@vercel/speed-insights/next'
import {Toaster} from 'sonner'
import IntroGate from '@/features/site-shell/components/IntroGate/IntroGate'
import SiteSectionsAccordion from '@/features/site-shell/components/SiteSectionsAccordion/SiteSectionsAccordion'
import Navbar from '@/features/site-shell/components/Navbar/Navbar'
import EasterEgg from '@/features/site-shell/components/EasterEgg/EasterEgg'
import type {StyleUpItem} from '@/features/style-ups/components/StyleUps/StyleUps'

const getSiteInitialData = createGetSiteInitialData({
    sanityFetch: ((args) => sanityFetch(args)) as <T>(
        args: SiteInitialDataFetchArgs,
    ) => Promise<{data: T}>,
    getProjects,
})

const getSiteMetadata = createGetSiteMetadata({
    sanityFetch: ((args) => sanityFetch(args)) as <T>(
        args: SiteMetadataFetchArgs,
    ) => Promise<{data: T}>,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
})

export async function generateMetadata(): Promise<Metadata> {
    return getSiteMetadata()
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default async function IndexRoute({children}: {children: React.ReactNode}) {
    const {about, contact, sidebarFilters, styleUps, initialProjects, initialFilter} =
        await getSiteInitialData()

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
                <Toaster />
                <SpeedInsights />
            </IntroGate>
        </>
    )
}
