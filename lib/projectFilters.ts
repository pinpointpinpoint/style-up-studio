import type {Filter, Project, ProjectCursor} from '@/types'

export const DEFAULT_PROJECT_FILTER: Filter = {
    type: 'featured',
}

export function getProjectCursor(
    project: Project | undefined,
    filter: Filter,
): ProjectCursor | null {
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
