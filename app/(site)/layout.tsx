import '@/styles/index.css'
import { sanityFetch } from '@/sanity/lib/live'
import { aboutSectionQuery, contactSectionQuery, seoSettingsQuery } from '@/sanity/lib/queries'
import type { Metadata, Viewport } from 'next'
import { toPlainText } from 'next-sanity'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import SplashGate from '@/components/SplashGate/SplashGate'
import AccordionNav from '@/components/Accordion/AccordionNav'
import Navbar from '@/components/Navbar/Navbar'
import EasterEgg from '@/components/EasterEgg/EasterEgg'

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
   const [{ data: about }, {data: contact}] = await Promise.all([
    sanityFetch({ query: aboutSectionQuery, stega: false }),
    sanityFetch({ query: contactSectionQuery, stega: false })
  ])


  return (
    <>
      <SplashGate>
        <div className="site">
          <Navbar about={about} contact={contact}/>
          <AccordionNav />
          <main className="site__main">
              {children}
          </main>
        </div>
        <EasterEgg />
        <Toaster />
        <SpeedInsights />
      </SplashGate>
    </>
  )
}
