import {sanityFetch} from '@/sanity/lib/fetch'
import {
    createSiteMetadataService,
    type SiteMetadataServiceFetchArgs,
} from '@/features/site-shell/services/siteMetadataService'
import type {Metadata, Viewport} from 'next'
import {SpeedInsights} from '@vercel/speed-insights/next'
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

export default function IndexRoute({children}: {children: React.ReactNode}) {
    return (
        <IntroGate>
            {children}
            <SiteConsoleCredits />
            <SpeedInsights />
        </IntroGate>
    )
}
