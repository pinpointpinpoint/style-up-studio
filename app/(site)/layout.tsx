import '@/styles/index.css'
import { Navbar } from '@/components/Navbar'
import { sanityFetch, SanityLive } from '@/sanity/lib/live'
import { homePageQuery, settingsQuery } from '@/sanity/lib/queries'
import { urlForOpenGraphImage } from '@/sanity/lib/utils'
import type { Metadata, Viewport } from 'next'
import { toPlainText } from 'next-sanity'
import { VisualEditing } from 'next-sanity/visual-editing'
import { draftMode } from 'next/headers'
import { handleError } from './client-functions'
import { DraftModeToast } from './DraftModeToast'
import { SpeedInsights } from '@vercel/speed-insights/next'

export async function generateMetadata(): Promise<Metadata> {
  const [{ data: settings }, { data: homePage }] = await Promise.all([
    sanityFetch({ query: settingsQuery, stega: false }),
    sanityFetch({ query: homePageQuery, stega: false }),
  ])

  const ogImage = urlForOpenGraphImage(
    // @ts-expect-error - @TODO update @sanity/image-url types so it's compatible
    settings?.ogImage,
  )

  return {
    title: homePage?.title
      ? {
        template: `%s | ${homePage.title}`,
        default: homePage.title,
      }
      : undefined,
    description: homePage?.overview ? toPlainText(homePage.overview) : undefined,
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#000',
}

export default async function IndexRoute({ children }: { children: React.ReactNode }) {


  // const {data} = await sanityFetch({query: settingsQuery})
  return (
    <>
      {/* <Suspense fallback={<div>LOADING...</div>}> */}
      <div className='site'>
        <Navbar /*data={data}*/ />
        <main className='site__main'>
          {children}
        </main>
      </div>
      {/* </Suspense> */}


      {/* Toast element from: https://ui.shadcn.com/ */}
      {/* <Toaster /> */}

      {/* Sanity Live */}
      <SanityLive onError={handleError} />

      {/*  Draft Mode and Visual Editing */}
      {(await draftMode()).isEnabled && (
        <>
          <DraftModeToast />
          <VisualEditing />
        </>
      )}

      {/* Speed Insights */}
      <SpeedInsights />
    </>
  )
}
