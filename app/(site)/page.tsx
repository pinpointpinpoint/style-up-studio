import {allCategoriesQuery, allStyleUpsQuery, homePageQuery} from '@/sanity/lib/queries'
import { allProjectsQuery } from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import Accordion from '@/components/Accordion/Accordion'

export default async function IndexRoute() {
  const [{ data: projects }, { data: categories },{ data: styleups }, { data: homePage }] = await Promise.all([

    // fetch when home accordion is active
    sanityFetch({ query: allProjectsQuery, stega: false }),
    sanityFetch({query: allCategoriesQuery, stega: false}),

    // should fetch when the styleups accordion is active...
    sanityFetch({query: allStyleUpsQuery, stega: false}),


    sanityFetch({ query: homePageQuery, stega: false }),
  ]);

  return <Accordion projects={projects} categories={categories} styleUps={styleups}/>

}