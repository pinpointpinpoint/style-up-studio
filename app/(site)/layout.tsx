import '@/styles/index.css'
import { sanityFetch, SanityLive } from '@/sanity/lib/live'
import { seoSettingsQuery } from '@/sanity/lib/queries'
import type { Metadata, Viewport } from 'next'
import { toPlainText } from 'next-sanity'
import { handleError } from './client-utils'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import SplashGate from '@/components/SplashGate/SplashGate'
import AccordionNav from '@/components/Accordion/AccordionNav'
import Navbar from '@/components/Navbar/Navbar'

// export async function generateMetadata(): Promise<Metadata> {
//   const [{ data: settings }] = await Promise.all([
//     sanityFetch({ query: seoSettingsQuery, stega: false })
//   ])
  
//   return {
//     title: settings?.title
//       ? {
//         template: `%s | ${settings.title}`,
//         default: settings.title,
//       }
//       : undefined,
//     description: settings?.description ? toPlainText(settings.description) : undefined,
//     openGraph: {
//       images: [
//         {
//           url: '/og/minimal_logo.png',
//           width: 1200,
//           height: 630,
//           alt: 'Logo',
//         },
//       ],
//     },
//   }
// }

// what does this do?
export const viewport: Viewport = {
  themeColor: '#000000ff',
}

export default async function IndexRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashGate>
        <div className="site">
          <Navbar />
          <AccordionNav />
          <main className="site__main">
              {children}
          </main>
        </div>
        <Toaster />
        <SanityLive onError={handleError} />
        <SpeedInsights />
      </SplashGate>
    </>
  )
}
