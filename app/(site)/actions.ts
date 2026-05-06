'use server'

import {createProjectService, type ProjectServiceFetch} from '@/features/work/services/projectService'
import {sanityFetch} from '@/sanity/lib/fetch'

const projectService = createProjectService({
    sanityFetch: ((args) => sanityFetch(args)) as ProjectServiceFetch,
})

export const getProjects = projectService.getProjects
export const getProjectBySlug = projectService.getProjectBySlug