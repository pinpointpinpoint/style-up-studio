import type {Project} from '@/types'
import {
    getProjectDetailMedia,
    type ProjectDetailMedia,
    type ProjectImageUrlResolver,
} from './projectMediaPresentation'

type ProjectDetailMediaViewOptions = {
    imageUrl: ProjectImageUrlResolver
    externalVideoPosterUrl?: (url: string) => string | null | undefined
}

export type ProjectDetailMediaView = {
    media: ProjectDetailMedia[]
    activeMediaIndex: number
}

export type ProjectDetailMediaSelection = ProjectDetailMediaView & {
    scrollTargetMediaIndex: number
}

type ProjectDetailMediaRect = {
    top: number
    height: number
}

type ProjectDetailMediaFrameRect = ProjectDetailMediaRect & {
    mediaIndex: number
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

export function selectProjectDetailMedia(
    view: ProjectDetailMediaView,
    mediaIndex: number,
): ProjectDetailMediaSelection {
    return {
        ...view,
        activeMediaIndex: mediaIndex,
        scrollTargetMediaIndex: mediaIndex,
    }
}

export function getProjectDetailMediaScrollSelection({
    currentActiveMediaIndex,
    paneRect,
    frameRects,
}: {
    currentActiveMediaIndex: number
    paneRect: ProjectDetailMediaRect
    frameRects: ProjectDetailMediaFrameRect[]
}) {
    const paneCenter = paneRect.top + paneRect.height / 2
    let nearestIndex = currentActiveMediaIndex
    let nearestDistance = Number.POSITIVE_INFINITY

    for (const frameRect of frameRects) {
        const frameCenter = frameRect.top + frameRect.height / 2
        const distance = Math.abs(frameCenter - paneCenter)

        if (distance < nearestDistance) {
            nearestDistance = distance
            nearestIndex = frameRect.mediaIndex
        }
    }

    return nearestIndex
}
