import '@/styles/index.css'
import { Suspense } from 'react'
import { DEFAULT_PROJECT_FILTER } from '@/lib/projectFilters'
import { sanityFetch } from '@/sanity/lib/live'
import { getProjects } from './actions'
import {
  aboutSectionQuery,
  allStyleUpsQuery,
  contactSectionQuery,
  seoSettingsQuery,
  sidebarFiltersQuery,
} from '@/sanity/lib/queries'
import type { Metadata, Viewport } from 'next'
import { toPlainText } from 'next-sanity'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import SplashGate from '@/components/SplashGate/SplashGate'
import AccordionNav from '@/components/Accordion/AccordionNav'
import Navbar from '@/components/Navbar/Navbar'
import EasterEgg from '@/components/EasterEgg/EasterEgg'
import type { StyleUpItem } from '@/components/StyleUps/StyleUps'

export async function generateMetadata(): Promise<Metadata> {
  const [{ data: settings }] = await Promise.all([
    sanityFetch({ query: seoSettingsQuery, stega: false })
  ])

  const siteTitle = 'Style Up Studio'
  
  return {
    title: {
      template: `%s | ${siteTitle}`,
      default: siteTitle,
    },
    description: settings?.description ? toPlainText(settings.description) : undefined,
    openGraph: {
      title: siteTitle,
      description: settings?.description ? toPlainText(settings.description) : undefined,
      images: [
        {
          url: '/og/minimal_logo.png',
          width: 1200,
          height: 630,
          alt: 'Logo',
        },
      ],
    },
  }
}

// what does this do?
export const viewport: Viewport = {
  themeColor: '#000000ff',
}

export default async function IndexRoute({ children }: { children: React.ReactNode }) {
   const [
    { data: about },
    { data: contact },
    { data: sidebarFilters },
    { data: styleUps },
    initialProjects,
  ] = await Promise.all([
    sanityFetch({ query: aboutSectionQuery, stega: false }),
    sanityFetch({ query: contactSectionQuery, stega: false }),
    sanityFetch({ query: sidebarFiltersQuery, stega: false }),
    sanityFetch({ query: allStyleUpsQuery, stega: false }),
    getProjects({
      filter: DEFAULT_PROJECT_FILTER,
      limit: 15,
    }),
  ])


  return (
    <>
      <SplashGate>
        <div className="site">
          <Navbar about={about} contact={contact}/>
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
