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

export type WorkFilterIndexInput = {
    featuredCount?: number | null
    allCount?: number | null
    projectTypes: SidebarFilterItem[]
    personalities: SidebarFilterItem[]
    brands: SidebarFilterItem[]
    settings?: SidebarFilterSettings | null
} | null

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

export type WorkFilterOption = {
    id: string
    title: string
    count: number
    filter: Filter
}

export type WorkCollaboratorFilterGroup = {
    id: string
    title: string
    filterType: 'brand' | 'personality'
    options: WorkFilterOption[]
}

export type WorkFilterIndex = {
    projectTypes: WorkFilterOption[]
    collaborators: WorkCollaboratorFilterGroup[]
}

export type WorkFilterCatalog = {
    filters: WorkFilterIndex
    parseFilter(searchParams: SearchParamsInput): Filter
    writeFilterToParams(
        filter: Filter,
        params?: URLSearchParams | ReadonlyURLSearchParams,
    ): URLSearchParams
    toggleFilter(currentFilter: Filter, nextFilter: Filter): Filter
}

function isVisibleOption(option: WorkFilterOption) {
    return Boolean(option.title && option.count > 0)
}

function toProjectTypeOption(item: SidebarFilterItem): WorkFilterOption {
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
): WorkFilterOption {
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

function isFilterTypeEnabled(
    sidebarFilters: WorkFilterIndexInput,
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

export function buildWorkFilterIndex(sidebarFilters: WorkFilterIndexInput): WorkFilterIndex {
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
    const projectTypes: WorkFilterOption[] = [
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

export function createWorkFilterCatalog(sidebarFilters: WorkFilterIndexInput): WorkFilterCatalog {
    return {
        filters: buildWorkFilterIndex(sidebarFilters),
        parseFilter: (searchParams) => parseWorkFilter(searchParams, sidebarFilters),
        writeFilterToParams: (filter, params) =>
            writeWorkFilterToParams(filter, sidebarFilters, params),
        toggleFilter: toggleWorkFilter,
    }
}

export function toggleWorkFilter(currentFilter: Filter, nextFilter: Filter): Filter {
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

export function parseWorkFilter(
    searchParams: SearchParamsInput,
    sidebarFilters: WorkFilterIndexInput,
): Filter {
    if (isFilterTypeEnabled(sidebarFilters, 'brand')) {
        const brandFilter = filterBySlug(
            'brand',
            sidebarFilters?.brands,
            readParam(searchParams, PARAM_KEYS.brand),
        )
        if (brandFilter) return brandFilter
    }

    if (isFilterTypeEnabled(sidebarFilters, 'personality')) {
        const personalityFilter = filterBySlug(
            'personality',
            sidebarFilters?.personalities,
            readParam(searchParams, PARAM_KEYS.personality),
        )
        if (personalityFilter) return personalityFilter
    }

    const view = readParam(searchParams, PARAM_KEYS.view)
    if (view === 'all') return {type: 'all'}
    if (view === 'featured') return {type: 'featured'}

    const projectTypeFilter = filterBySlug(
        'projectType',
        sidebarFilters?.projectTypes,
        readParam(searchParams, PARAM_KEYS.projectType),
    )

    return projectTypeFilter ?? {type: 'featured'}
}

export function writeWorkFilterToParams(
    filter: Filter,
    sidebarFilters: WorkFilterIndexInput,
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
        brand: isFilterTypeEnabled(sidebarFilters, 'brand') ? sidebarFilters?.brands : undefined,
        personality: isFilterTypeEnabled(sidebarFilters, 'personality')
            ? sidebarFilters?.personalities
            : undefined,
    }
    const slug = findSlugById(itemsByType[filter.type], filter.id)

    if (slug) {
        nextParams.set(PARAM_KEYS[filter.type], slug)
    }

    return nextParams
}
