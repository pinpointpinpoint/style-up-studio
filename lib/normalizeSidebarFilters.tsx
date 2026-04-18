import { FilterOption } from '@/types'

export function normalizeSidebarFilters(sidebarFilters: any) {
  if (!sidebarFilters) {
    return {
      projectTypes: [],
      collaborators: []
    }
  }

  const projectTypes: FilterOption[] = [
    {
      _id: "featured",
      title: "Featured",
      slug: "featured",
      referenceCount: sidebarFilters.featuredCount ?? 0
    },
    {
      _id: "all",
      title: "All",
      slug: "all",
      referenceCount: sidebarFilters.allCount ?? 0
    },
    ...(sidebarFilters.projectTypes ?? [])
  ]

  const collaborators = [
    {
      _id: "personality",
      label: "Personalities",
      filterType: "personality",
      items: sidebarFilters.personalities ?? []
    },
    {
      _id: "brands",
      label: "Brands",
      filterType: "brand",
      items: sidebarFilters.brands ?? []
    },
    {
      _id: "publications",
      label: "Publications",
      filterType: "publication",
      items: sidebarFilters.publications ?? []
    }
  ]

  const visibleCollaborators = collaborators.filter(
    (c) => c.items.some((item: FilterOption) => item.slug && item.referenceCount > 0)
  )

  return {
    projectTypes,
    collaborators: visibleCollaborators.map((c) => ({
      ...c,
      items: c.items.filter((item: FilterOption) => item.slug && item.referenceCount > 0)
    }))
  }
}
