import type {Metadata} from 'next'
import {SANITY_PUBLIC_TAG, SANITY_SEO_TAG} from '../../../sanity/lib/cacheTags'
import {seoSettingsQuery} from '../../../sanity/lib/queries'

type SeoSettings = {
    description?: string | null
} | null

export type SiteMetadataFetchArgs = {
    name: 'seoSettings'
    query: string
    stega: false
    tags?: string[]
}

type SiteMetadataFetch = <T>(args: SiteMetadataFetchArgs) => Promise<{data: T}>

type SiteMetadataGetterDependencies = {
    sanityFetch: SiteMetadataFetch
    siteUrl?: string
}

const SITE_TITLE = 'Style Up Studio'
const DEFAULT_SITE_URL = 'http://localhost:3000'
const OG_IMAGE = '/og_image.png'

export function createGetSiteMetadata({
    sanityFetch,
    siteUrl,
}: SiteMetadataGetterDependencies) {
    return async function getSiteMetadata(): Promise<Metadata> {
        const publicSiteUrl = siteUrl ?? DEFAULT_SITE_URL
        const {data: settings} = await sanityFetch<SeoSettings>({
            name: 'seoSettings',
            query: seoSettingsQuery,
            stega: false,
            tags: [SANITY_PUBLIC_TAG, SANITY_SEO_TAG],
        })

        return {
            metadataBase: new URL(publicSiteUrl),
            title: {
                template: `%s | ${SITE_TITLE}`,
                default: SITE_TITLE,
            },
            description: settings?.description,
            openGraph: {
                title: SITE_TITLE,
                description: settings?.description ?? undefined,
                url: publicSiteUrl,
                siteName: SITE_TITLE,
                images: [
                    {
                        url: OG_IMAGE,
                        width: 1200,
                        height: 630,
                        alt: 'Style Up Studio logo',
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: SITE_TITLE,
                description: settings?.description ?? undefined,
                images: [OG_IMAGE],
            },
        }
    }
}
