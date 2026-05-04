'use server'

import {createProjectReadModel, type ProjectReadFetch} from '@/lib/projectReadModel'
import {SANITY_PROJECTS_TAG, sanityFetch} from '@/sanity/lib/fetch'

const projectReadModel = createProjectReadModel({
    sanityFetch: ((args) =>
        sanityFetch({
            ...args,
            tags: [...(args.tags ?? []), SANITY_PROJECTS_TAG],
        })) as ProjectReadFetch,
})

export const getProjects = projectReadModel.getProjects
export const getProjectBySlug = projectReadModel.getProjectBySlug
