import type {Project} from '@/types'
import {
    getProjectDetailMedia,
    type ProjectDetailMedia,
    type ProjectImageSourceSetResolver,
    type ProjectImageUrlResolver,
} from './projectMediaPresentation'

type ProjectDetailMediaViewOptions = {
    imageUrl: ProjectImageUrlResolver
    imageSourceSet?: ProjectImageSourceSetResolver
    externalVideoPosterUrl?: (url: string) => string | null | undefined
}

export type ProjectDetailMediaView = {
    media: ProjectDetailMedia[]
    activeMediaIndex: number
}

export function createProjectDetailMediaView(
    project: Project,
    options: ProjectDetailMediaViewOptions,
): ProjectDetailMediaView {
    const media = getProjectDetailMedia(project, options)

    return {
        media,
        activeMediaIndex: media[0]?.mediaIndex ?? 0,
    }
}
