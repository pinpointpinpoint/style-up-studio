import {HomePage} from '@/components/HomePage'
import {studioUrl} from '@/sanity/lib/api'
import {sanityFetch} from '@/sanity/lib/live'
import {homePageQuery} from '@/sanity/lib/queries'
import Link from 'next/link'
import {Chivo} from 'next/font/google'

const chivo = Chivo({subsets: ['latin']})

export default async function IndexRoute() {
  const {data} = await sanityFetch({query: homePageQuery})
  const isUnderConstruction = true;

  if (isUnderConstruction) {
    return (
      <div className={`${chivo.className} flex min-h-[100dvh] items-center justify-center p-6 text-center`}>
        [SITE UNDER CONSTRUCTION]
      </div>
    )
  }

  return <div className={chivo.className}><HomePage data={data} /></div>
}
