import type { SidebarFiltersQueryResult } from '@/sanity.types'
import type { FilterOption } from '@/types'

type CollaboratorFilterType = 'brand' | 'personality'
type SidebarFilterSettings = {
  showPersonalities?: boolean | null
  showBrands?: boolean | null
}

type SidebarFiltersInput = SidebarFiltersQueryResult & {
  settings?: SidebarFilterSettings | null
}

type SidebarFilterItem = SidebarFiltersQueryResult[
  'projectTypes' | 'personalities' | 'brands'
][number]

export type NormalizedCollaboratorGroup = {
  _id: string
  label: string
  filterType: CollaboratorFilterType
  items: FilterOption[]
}

export type NormalizedSidebarFilters = {
  projectTypes: FilterOption[]
  collaborators: NormalizedCollaboratorGroup[]
}

function isVisibleFilterOption(item: FilterOption) {
  return Boolean(item.slug && item.title && item.referenceCount > 0)
}

function normalizeFilterOption(item: SidebarFilterItem): FilterOption {
  return {
    _id: item._id,
    title: item.title ?? '',
    slug: item.slug ?? '',
    referenceCount: item.referenceCount,
  }
}

export function normalizeSidebarFilters(
  sidebarFilters: SidebarFiltersInput | null,
): NormalizedSidebarFilters {
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
    ...sidebarFilters.projectTypes.map(normalizeFilterOption)
  ].filter(isVisibleFilterOption)

  const showPersonalities = sidebarFilters.settings?.showPersonalities ?? true
  const showBrands = sidebarFilters.settings?.showBrands ?? true

  const collaborators = [
    showPersonalities && {
      _id: "personality",
      label: "Personalities",
      filterType: "personality" as const,
      items: sidebarFilters.personalities.map(normalizeFilterOption)
    },
    showBrands && {
      _id: "brands",
      label: "Brands",
      filterType: "brand" as const,
      items: sidebarFilters.brands.map(normalizeFilterOption)
    }
  ].filter((group): group is NormalizedCollaboratorGroup => Boolean(group))

  const visibleCollaborators = collaborators.filter(
    (c) => c.items.some(isVisibleFilterOption)
  )

  return {
    projectTypes,
    collaborators: visibleCollaborators.map((c) => ({
      ...c,
      items: c.items.filter(isVisibleFilterOption)
    }))
  }
}
