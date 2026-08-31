import type {Filter} from '@/types'

type SidebarFilterItem = {
    _id: string
    title?: string | null
    slug?: string | null
    referenceCount: number
}

type SidebarFilterSettings = {
    showPersonalities?: boolean | null
    showBrands?: boolean | null
}

export type WorkIndexInput = {
    featuredCount?: number | null
    allCount?: number | null
    projectTypes: SidebarFilterItem[]
    personalities: SidebarFilterItem[]
    brands: SidebarFilterItem[]
    settings?: SidebarFilterSettings | null
} | null

export type WorkIndexOption = {
    id: string
    title: string
    count: number
    filter: Filter
}

export type WorkCollaboratorFilterGroup = {
    id: string
    title: string
    filterType: 'brand' | 'personality'
    options: WorkIndexOption[]
}

export type WorkIndex = {
    projectTypes: WorkIndexOption[]
    collaborators: WorkCollaboratorFilterGroup[]
}

export type WorkIndexCatalog = {
    filters: WorkIndex
    parsePath(pathname: string): Filter
    getHref(filter: Filter): string
    getTitle(filter: Filter): string | null
    toggleFilter(currentFilter: Filter, nextFilter: Filter): Filter
}

function isVisibleOption(option: WorkIndexOption) {
    return Boolean(option.title && option.count > 0)
}

function toProjectTypeOption(item: SidebarFilterItem): WorkIndexOption {
    return {
        id: item._id,
        title: item.title ?? '',
        count: item.referenceCount,
        filter: {type: 'projectType', id: item._id},
    }
}

function toCollaboratorOption(
    type: 'brand' | 'personality',
    item: SidebarFilterItem,
): WorkIndexOption {
    return {
        id: item._id,
        title: item.title ?? '',
        count: item.referenceCount,
        filter: {type, id: item._id},
    }
}

function toVisibleCollaboratorOptions(type: 'brand' | 'personality', items: SidebarFilterItem[]) {
    return items
        .filter((item) => item.slug)
        .map((item) => toCollaboratorOption(type, item))
        .filter(isVisibleOption)
}

function findIdBySlug(items: SidebarFilterItem[] | undefined, slug: string) {
    return items?.find((item) => item.slug === slug)?._id
}

function findSlugById(items: SidebarFilterItem[] | undefined, id: string) {
    return items?.find((item) => item._id === id)?.slug
}

function getPathSegments(pathname: string) {
    return (
        pathname
            .split('?')[0]
            ?.split('#')[0]
            ?.split('/')
            .filter(Boolean)
            .map((segment) => decodeURIComponent(segment)) ?? []
    )
}

function isFilterTypeEnabled(
    sidebarFilters: WorkIndexInput,
    type: 'brand' | 'personality' | 'projectType',
) {
    if (type === 'brand') return sidebarFilters?.settings?.showBrands ?? true
    if (type === 'personality') return sidebarFilters?.settings?.showPersonalities ?? true

    return true
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

export function buildWorkIndex(sidebarFilters: WorkIndexInput): WorkIndex {
    if (!sidebarFilters) {
        return {
            projectTypes: [],
            collaborators: [],
        }
    }

    const showPersonalities = sidebarFilters.settings?.showPersonalities ?? true
    const showBrands = sidebarFilters.settings?.showBrands ?? true
    const personalities = showPersonalities
        ? toVisibleCollaboratorOptions('personality', sidebarFilters.personalities)
        : []
    const brands = showBrands ? toVisibleCollaboratorOptions('brand', sidebarFilters.brands) : []
    const projectTypes: WorkIndexOption[] = [
        {
            id: 'featured',
            title: 'Featured',
            count: sidebarFilters.featuredCount ?? 0,
            filter: {type: 'featured'},
        },
        {
            id: 'all',
            title: 'All',
            count: sidebarFilters.allCount ?? 0,
            filter: {type: 'all'},
        },
        ...sidebarFilters.projectTypes.filter((item) => item.slug).map(toProjectTypeOption),
    ]

    return {
        projectTypes: projectTypes.filter(isVisibleOption),
        collaborators: [
            personalities.length > 0 && {
                id: 'personality',
                title: 'Personalities',
                filterType: 'personality' as const,
                options: personalities,
            },
            brands.length > 0 && {
                id: 'brands',
                title: 'Brands',
                filterType: 'brand' as const,
                options: brands,
            },
        ].filter((group): group is WorkCollaboratorFilterGroup => Boolean(group)),
    }
}

export function createWorkIndexCatalog(sidebarFilters: WorkIndexInput): WorkIndexCatalog {
    return {
        filters: buildWorkIndex(sidebarFilters),
        parsePath: (pathname) => parseWorkIndexPath(pathname, sidebarFilters),
        getHref: (filter) => getWorkIndexHref(filter, sidebarFilters),
        getTitle: (filter) => getWorkIndexTitle(filter, sidebarFilters),
        toggleFilter: toggleWorkIndex,
    }
}

export function toggleWorkIndex(currentFilter: Filter, nextFilter: Filter): Filter {
    if (
        'id' in currentFilter &&
        'id' in nextFilter &&
        currentFilter.type === nextFilter.type &&
        currentFilter.id === nextFilter.id
    ) {
        return {type: 'featured'}
    }

    return nextFilter
}

export function parseWorkIndexPath(pathname: string, sidebarFilters: WorkIndexInput): Filter {
    const segments = getPathSegments(pathname)

    if (segments.length === 0) {
        return {type: 'featured'}
    }

    if (segments[0] !== 'work') {
        return {type: 'featured'}
    }

    if (segments.length === 1) {
        return {type: 'featured'}
    }

    if (segments[1] === 'all') {
        return {type: 'all'}
    }

    if (segments[1] === 'type') {
        return (
            filterBySlug('projectType', sidebarFilters?.projectTypes, segments[2]) ?? {
                type: 'featured',
            }
        )
    }

    if (segments[1] === 'brand' && isFilterTypeEnabled(sidebarFilters, 'brand')) {
        return filterBySlug('brand', sidebarFilters?.brands, segments[2]) ?? {type: 'featured'}
    }

    if (segments[1] === 'personality' && isFilterTypeEnabled(sidebarFilters, 'personality')) {
        return (
            filterBySlug('personality', sidebarFilters?.personalities, segments[2]) ?? {
                type: 'featured',
            }
        )
    }

    return {type: 'featured'}
}

export function getWorkIndexHref(filter: Filter, sidebarFilters: WorkIndexInput) {
    if (filter.type === 'featured') {
        return '/'
    }

    if (filter.type === 'all') {
        return '/work/all'
    }

    const itemsByType = {
        projectType: sidebarFilters?.projectTypes,
        brand: isFilterTypeEnabled(sidebarFilters, 'brand') ? sidebarFilters?.brands : undefined,
        personality: isFilterTypeEnabled(sidebarFilters, 'personality')
            ? sidebarFilters?.personalities
            : undefined,
    }
    const slug = findSlugById(itemsByType[filter.type], filter.id)

    if (!slug) {
        return '/'
    }

    if (filter.type === 'projectType') {
        return `/work/type/${encodeURIComponent(slug)}`
    }

    return `/work/${filter.type}/${encodeURIComponent(slug)}`
}

export function getWorkIndexTitle(filter: Filter, sidebarFilters: WorkIndexInput) {
    if (filter.type === 'featured') {
        return 'Featured'
    }

    if (filter.type === 'all') {
        return 'All'
    }

    const itemsByType = {
        projectType: sidebarFilters?.projectTypes,
        brand: isFilterTypeEnabled(sidebarFilters, 'brand') ? sidebarFilters?.brands : undefined,
        personality: isFilterTypeEnabled(sidebarFilters, 'personality')
            ? sidebarFilters?.personalities
            : undefined,
    }

    return itemsByType[filter.type]?.find((item) => item._id === filter.id)?.title ?? null
}
