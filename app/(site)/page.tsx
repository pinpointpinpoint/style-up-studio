import { sanityFetch } from '@/sanity/lib/live'
import {sidebarFiltersQuery} from '@/sanity/lib/queries'
import { WorkSection } from '@/components/WorkSection/WorkSection';
import { getProjects } from './actions';
import { parseProjectFilter } from '@/lib/projectFilters';

type IndexRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function IndexRoute({ searchParams }: IndexRouteProps) {
  const [{ data: sidebarFilters }, resolvedSearchParams] = await Promise.all([
    sanityFetch({
      query: sidebarFiltersQuery,
      stega: false,
    }),
    searchParams,
  ])
  const initialFilter = parseProjectFilter(resolvedSearchParams, sidebarFilters)
  const initialProjects = await getProjects({
    filter: initialFilter,
    limit: 15,
  })

  return (
    <WorkSection
      initialProjects={initialProjects}
      initialFilter={initialFilter}
      sidebarFilters={sidebarFilters}
    />
  )
}
