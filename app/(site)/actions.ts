'use server'

import {createProjectReadModel, type ProjectReadFetch} from '@/features/work/lib/projectReadModel'
import {sanityFetch} from '@/sanity/lib/fetch'

const projectReadModel = createProjectReadModel({
    sanityFetch: ((args) => sanityFetch(args)) as ProjectReadFetch,
})

export const getProjects = projectReadModel.getProjects
export const getProjectBySlug = projectReadModel.getProjectBySlug
