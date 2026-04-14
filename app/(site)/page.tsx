import {allProjectTypesQuery, allStyleUpsQuery, featuredProjectsQuery, projectsQuery} from '@/sanity/lib/queries'
import { sanityFetch } from '@/sanity/lib/live'
import Accordion from '@/components/Accordion/Accordion'

export default async function IndexRoute() {
  const [{ data: featuredProjects }, { data: projectTypes },{ data: styleups }] = await Promise.all([
    sanityFetch({ query: featuredProjectsQuery, stega: false }),
    sanityFetch({query: allProjectTypesQuery, stega: false}),
    // should fetch when the styleups accordion is active...
    sanityFetch({query: allStyleUpsQuery, stega: false}),
  ]);

  return <Accordion featuredProjects={featuredProjects} projectTypes={projectTypes} styleUps={styleups}/>
}