'use server'

import { sanityFetch } from "@/sanity/lib/live";
import { featuredProjectsQuery, projectBySlugQuery, projectsQuery } from "@/sanity/lib/queries";
import { DEFAULT_PROJECT_FILTER } from "@/lib/projectFilters";
import type { Filter, ProjectsQueryInput } from "@/types";

const DEFAULT_LIMIT = 2

function normalizeFilter(filter?: Partial<Filter> | null): Filter {
  return filter?.type ? filter as Filter : DEFAULT_PROJECT_FILTER
}

export async function getProjects(input: ProjectsQueryInput) {
  const filter = normalizeFilter(input.filter)
  const cursor = input.cursor ?? null
  const useFeaturedOrder = filter.type === 'featured'
  const query = useFeaturedOrder ? featuredProjectsQuery : projectsQuery
  const limit = input.limit ?? DEFAULT_LIMIT

  const { data } = await sanityFetch({
    query,
    stega: false,
    params: {
      filterType: filter.type,
      filterId: 'id' in filter ? filter.id : "",
      cursorOrderRank: cursor?.type === 'featured' ? cursor.orderRank ?? null : null,
      cursorDate: cursor?.type === 'date' ? cursor.date ?? null : null,
      cursorId: cursor?.id ?? "",
      limit,
    },
  });

  return data;
}