import '@/styles/index.css'
import { Navbar } from '@/components/Navbar/Navbar'
import { sanityFetch, SanityLive } from '@/sanity/lib/live'
import { homePageQuery, settingsQuery } from '@/sanity/lib/queries'
import { urlForOpenGraphImage } from '@/sanity/lib/utils'
import type { Metadata, Viewport } from 'next'
import { toPlainText } from 'next-sanity'
import { VisualEditing } from 'next-sanity/visual-editing'
import { handleError } from './client-utils'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Suspense } from 'react'
import { Toaster } from 'sonner'
import SplashGate from '@/components/SplashGate/SplashGate'

// export async function generateMetadata(): Promise<Metadata> {
//   const [{ data: settings }, { data: homePage }] = await Promise.all([
//     sanityFetch({ query: settingsQuery, stega: false }),
//     sanityFetch({ query: homePageQuery, stega: false }),
//   ])

//   const ogImage = urlForOpenGraphImage(
//     settings?.ogImage,
//   )

//   return {
//     title: homePage?.title
//       ? {
//         template: `%s | ${homePage.title}`,
//         default: homePage.title,
//       }
//       : undefined,
//     description: homePage?.overview ? toPlainText(homePage.overview) : undefined,
//     openGraph: {
//       images: ogImage ? [ogImage] : [],
//     },
//   }
// }

export const viewport: Viewport = {
  themeColor: '#000',
}

export default async function IndexRoute({ children }: { children: React.ReactNode }) {
  // const {data} = await sanityFetch({query: settingsQuery})
  return (
    <SplashGate>
        <div className='site'>
          <Navbar/>
          <main className='site__main'>
            {children}
          </main>
        </div>

      <Toaster />

      {/* Sanity Live */}
      <SanityLive onError={handleError} />

      {/* Speed Insights */}
      <SpeedInsights />
    </SplashGate>
  )
}
