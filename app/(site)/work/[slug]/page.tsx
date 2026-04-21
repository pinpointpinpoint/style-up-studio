import { notFound } from 'next/navigation'
import { WorkSection } from '@/components/WorkSection/WorkSection'
import { parseProjectFilter } from '@/lib/projectFilters'
import { sanityFetch } from '@/sanity/lib/live'
import { projectBySlugQuery, sidebarFiltersQuery } from '@/sanity/lib/queries'
import type { Project } from '@/types'
import { getProjects } from '../../actions'

type ProjectRouteProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProjectRoute({ params, searchParams }: ProjectRouteProps) {
  const [{ slug }, resolvedSearchParams, { data: sidebarFilters }] = await Promise.all([
    params,
    searchParams,
    sanityFetch({
      query: sidebarFiltersQuery,
      stega: false,
    }),
  ])
  const initialFilter = parseProjectFilter(resolvedSearchParams, sidebarFilters)
  const [{ data: selectedProject }, initialProjects] = await Promise.all([
    sanityFetch({
      query: projectBySlugQuery,
      params: { slug },
      stega: false,
    }),
    getProjects({
      filter: initialFilter,
      limit: 15,
    }),
  ])

  if (!selectedProject) {
    notFound()
  }

  return (
    <WorkSection
      initialProjects={initialProjects}
      initialFilter={initialFilter}
      sidebarFilters={sidebarFilters}
      selectedProject={selectedProject as Project}
    />
  )
}
