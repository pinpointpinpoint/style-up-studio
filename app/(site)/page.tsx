import {allCategoriesQuery, allStyleUpsQuery, featuredProjectsQuery} from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import Accordion from '@/components/Accordion/Accordion'

export default async function IndexRoute() {
  const [{ data: projects }, { data: categories },{ data: styleups }] = await Promise.all([

    // Fetch featured projects on initial load
    sanityFetch({ query: featuredProjectsQuery, stega: false }),

    sanityFetch({query: allCategoriesQuery, stega: false}),

    // should fetch when the styleups accordion is active...
    sanityFetch({query: allStyleUpsQuery, stega: false}),
  ]);

  return <Accordion projects={projects} categories={categories} styleUps={styleups}/>
}