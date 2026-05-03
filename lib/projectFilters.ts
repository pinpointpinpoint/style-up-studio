import type {Filter, Project, ProjectCursor} from '@/types'

export const DEFAULT_PROJECT_FILTER: Filter = {
  type: 'featured',
}

const PARAM_KEYS = {
  view: 'view',
  projectType: 'projectType',
  brand: 'brand',
  personality: 'personality',
} as const

type SearchParamValue = string | string[] | undefined
type SearchParamsInput =
  | URLSearchParams
  | ReadonlyURLSearchParams
  | Record<string, SearchParamValue>
  | undefined

type ReadonlyURLSearchParams = {
  get(name: string): string | null
  toString(): string
}

type SidebarFilterItem = {
  _id: string
  slug?: string | null
}

type SidebarFilters = {
  projectTypes?: SidebarFilterItem[]
  brands?: SidebarFilterItem[]
  personalities?: SidebarFilterItem[]
  settings?: {
    showPersonalities?: boolean | null
    showBrands?: boolean | null
  } | null
} | null | undefined

function readParam(searchParams: SearchParamsInput, key: string) {
  if (!searchParams) return undefined

  if ('get' in searchParams && typeof searchParams.get === 'function') {
    return searchParams.get(key) ?? undefined
  }

  const value = (searchParams as Record<string, SearchParamValue>)[key]
  return Array.isArray(value) ? value[0] : value
}

function findIdBySlug(items: SidebarFilterItem[] | undefined, slug: string) {
  return items?.find((item) => item.slug === slug)?._id
}

function findSlugById(items: SidebarFilterItem[] | undefined, id: string) {
  return items?.find((item) => item._id === id)?.slug
}

function filterBySlug(
  type: 'brand' | 'personality' | 'projectType',
  items: SidebarFilterItem[] | undefined,
  slug: string | undefined,
): Filter | null {
  if (!slug) return null

  const id = findIdBySlug(items, slug)
  return id ? {type, id} : null
}

function isSidebarFilterTypeEnabled(
  sidebarFilters: SidebarFilters,
  type: 'brand' | 'personality' | 'projectType',
) {
  if (type === 'brand') return sidebarFilters?.settings?.showBrands ?? true
  if (type === 'personality') return sidebarFilters?.settings?.showPersonalities ?? true

  return true
}

export function parseProjectFilter(
  searchParams: SearchParamsInput,
  sidebarFilters?: SidebarFilters,
): Filter {
  if (isSidebarFilterTypeEnabled(sidebarFilters, 'brand')) {
    const brandFilter = filterBySlug('brand', sidebarFilters?.brands, readParam(searchParams, PARAM_KEYS.brand))
    if (brandFilter) return brandFilter
  }

  if (isSidebarFilterTypeEnabled(sidebarFilters, 'personality')) {
    const personalityFilter = filterBySlug(
      'personality',
      sidebarFilters?.personalities,
      readParam(searchParams, PARAM_KEYS.personality),
    )
    if (personalityFilter) return personalityFilter
  }

  const view = readParam(searchParams, PARAM_KEYS.view)
  if (view === 'all') return {type: 'all'}
  if (view === 'featured') return DEFAULT_PROJECT_FILTER

  const projectType = readParam(searchParams, PARAM_KEYS.projectType)

  const projectTypeFilter = filterBySlug('projectType', sidebarFilters?.projectTypes, projectType)
  return projectTypeFilter ?? DEFAULT_PROJECT_FILTER
}

export function writeProjectFilterToParams(
  filter: Filter,
  sidebarFilters?: SidebarFilters,
  params: URLSearchParams | ReadonlyURLSearchParams = new URLSearchParams(),
) {
  const nextParams = new URLSearchParams(params.toString())

  Object.values(PARAM_KEYS).forEach((key) => nextParams.delete(key))

  if (filter.type === 'featured') {
    return nextParams
  }

  if (filter.type === 'all') {
    nextParams.set(PARAM_KEYS.view, 'all')
    return nextParams
  }

  const itemsByType = {
    projectType: sidebarFilters?.projectTypes,
    brand: isSidebarFilterTypeEnabled(sidebarFilters, 'brand') ? sidebarFilters?.brands : undefined,
    personality: isSidebarFilterTypeEnabled(sidebarFilters, 'personality') ? sidebarFilters?.personalities : undefined,
  }
  const slug = findSlugById(itemsByType[filter.type], filter.id)

  if (slug) {
    nextParams.set(PARAM_KEYS[filter.type], slug)
  }

  return nextParams
}

export function getProjectCursor(project: Project | undefined, filter: Filter): ProjectCursor | null {
  if (!project) return null

  if (filter.type === 'featured') {
    return {
      type: 'featured',
      orderRank: project.orderRank ?? null,
      id: project._id,
    }
  }

  return {
    type: 'date',
    date: project.date ?? null,
    id: project._id,
  }
}
