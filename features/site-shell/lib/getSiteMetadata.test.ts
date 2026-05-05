import {describe, expect, it} from 'vitest'
import {SANITY_PUBLIC_TAG, SANITY_SEO_TAG} from '../../../sanity/lib/cacheTags'
import {createGetSiteMetadata, type SiteMetadataFetchArgs} from './getSiteMetadata'

describe('get site metadata', () => {
    it('loads SEO settings and maps them to public site metadata', async () => {
        const fetchRequests: SiteMetadataFetchArgs[] = []
        const getSiteMetadata = createGetSiteMetadata({
            siteUrl: 'https://styleup.example',
            sanityFetch: async <T>(args: SiteMetadataFetchArgs) => {
                fetchRequests.push(args)

                return {data: {description: 'Editorial styling portfolio'} as T}
            },
        })

        await expect(getSiteMetadata()).resolves.toMatchObject({
            metadataBase: new URL('https://styleup.example'),
            title: {
                template: '%s | Style Up Studio',
                default: 'Style Up Studio',
            },
            description: 'Editorial styling portfolio',
            openGraph: {
                title: 'Style Up Studio',
                description: 'Editorial styling portfolio',
                url: 'https://styleup.example',
                siteName: 'Style Up Studio',
            },
            twitter: {
                card: 'summary_large_image',
                title: 'Style Up Studio',
                description: 'Editorial styling portfolio',
            },
        })
        expect(fetchRequests).toEqual([
            {
                name: 'seoSettings',
                query: expect.any(String),
                stega: false,
                tags: [SANITY_PUBLIC_TAG, SANITY_SEO_TAG],
            },
        ])
    })

    it('falls back to the local site URL when no public site URL is configured', async () => {
        const getSiteMetadata = createGetSiteMetadata({
            sanityFetch: async <T>() => ({data: null as T}),
        })

        await expect(getSiteMetadata()).resolves.toMatchObject({
            metadataBase: new URL('http://localhost:3000'),
            openGraph: {
                url: 'http://localhost:3000',
            },
        })
    })
})
