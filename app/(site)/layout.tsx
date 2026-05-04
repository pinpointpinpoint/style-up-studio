import '@/styles/index.css'
import {Suspense} from 'react'
import {DEFAULT_PROJECT_FILTER} from '@/lib/projectFilters'
import {PROJECTS_PAGE_SIZE} from '@/lib/workBrowsingConfig'
import {SANITY_PROJECTS_TAG, sanityFetch} from '@/sanity/lib/fetch'
import {getProjects} from './actions'
import {
    aboutSectionQuery,
    allStyleUpsQuery,
    contactSectionQuery,
    seoSettingsQuery,
    sidebarFiltersQuery,
} from '@/sanity/lib/queries'
import type {Metadata, Viewport} from 'next'
import {SpeedInsights} from '@vercel/speed-insights/next'
import {Toaster} from 'sonner'
import SplashGate from '@/components/SplashGate/SplashGate'
import AccordionNav from '@/components/Accordion/AccordionNav'
import Navbar from '@/components/Navbar/Navbar'
import EasterEgg from '@/components/EasterEgg/EasterEgg'
import type {StyleUpItem} from '@/components/StyleUps/StyleUps'
import type {
    About,
    AllStyleUpsQueryResult,
    Contact,
    SidebarFiltersQueryResult,
} from '@/sanity.types'

type SeoSettingsQueryResult = {
    description?: string | null
} | null

export async function generateMetadata(): Promise<Metadata> {
  const [{ data: settings }] = await Promise.all([
    sanityFetch<SeoSettingsQueryResult>({
      query: seoSettingsQuery,
      stega: false,
    }),
  ])

  const siteTitle = 'Style Up Studio'
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return {
    metadataBase: new URL(siteUrl),

    title: {
      template: `%s | ${siteTitle}`,
      default: siteTitle,
    },

    description: settings?.description,

    openGraph: {
      title: siteTitle,
      description: settings?.description ?? undefined,
      url: siteUrl,
      siteName: siteTitle,
      images: [
        {
          url: '/og/minimal_logo.png',
          width: 1200,
          height: 630,
          alt: 'Style Up Studio logo',
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: settings?.description ?? undefined,
      images: ['/og/minimal_logo.png'],
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default async function IndexRoute({children}: {children: React.ReactNode}) {
    const [
        {data: about},
        {data: contact},
        {data: sidebarFilters},
        {data: styleUps},
        initialProjects,
    ] = await Promise.all([
        sanityFetch<Pick<About, 'bio' | 'image'> | null>({query: aboutSectionQuery, stega: false}),
        sanityFetch<Pick<Contact, 'email' | 'instagram'> | null>({
            query: contactSectionQuery,
            stega: false,
        }),
        sanityFetch<SidebarFiltersQueryResult>({
            query: sidebarFiltersQuery,
            stega: false,
            tags: [SANITY_PROJECTS_TAG],
        }),
        sanityFetch<AllStyleUpsQueryResult>({query: allStyleUpsQuery, stega: false}),
        getProjects({
            filter: DEFAULT_PROJECT_FILTER,
            limit: PROJECTS_PAGE_SIZE,
        }),
    ])

    return (
        <>
            <SplashGate>
                <div className="site">
                    <Navbar about={about} contact={contact} />
                    <Suspense fallback={null}>
                        <AccordionNav
                            initialProjects={initialProjects}
                            initialFilter={DEFAULT_PROJECT_FILTER}
                            sidebarFilters={sidebarFilters}
                            styleUps={styleUps as StyleUpItem[]}
                        >
                            {children}
                        </AccordionNav>
                    </Suspense>
                </div>
                <EasterEgg />
                <Toaster />
                <SpeedInsights />
            </SplashGate>
        </>
    )
}
