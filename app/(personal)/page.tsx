import {HomePage} from '@/components/HomePage'
import {studioUrl} from '@/sanity/lib/api'
import {allCategoriesQuery, allStyleUpsQuery, homePageQuery} from '@/sanity/lib/queries'
import Link from 'next/link'


import { Work } from '@/components/Work'
import { allProjectsQuery } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'

export default async function IndexRoute() {
  const [{ data: projects }, { data: categories },{ data: styleups }, { data: homePage }] = await Promise.all([
    sanityFetch({ query: allProjectsQuery, stega: false }),
    sanityFetch({query: allCategoriesQuery, stega: false}),

    // should fetch when the styleups accordion opens...
    sanityFetch({query: allStyleUpsQuery, stega: false}),

    sanityFetch({ query: homePageQuery, stega: false }),
  ]);

  if (!projects) {
    return (
      <div className="text-center">
        You don&rsquo;t have a homepage yet,{' '}
        <Link href={`${studioUrl}/structure/home`} className="underline">
          create one now
        </Link>
        !
      </div>
    )
  }

  return <HomePage 
              projects={projects} 
              categories={categories}
              styleUps={styleups}
          />

}