import type {Project} from '@/types'
import {
    getProjectThumbnails,
    type ProjectImageUrlResolver,
    type ProjectThumbnail,
} from './projectMediaPresentation'

type ProjectSidebarMediaOptions = {
    imageUrl: ProjectImageUrlResolver
    externalVideoThumbnailUrl?: (
        url: string,
        preset: `thumbnail-${number}`,
    ) => string | null | undefined
    thumbnailHeight: number
    visibleThumbnailCount?: number | null
}

export type ProjectSidebarMedia = {
    thumbnails: ProjectThumbnail[]
    visibleThumbnails: ProjectThumbnail[]
    hiddenThumbnailCount: number
}

type VisibleSidebarThumbnailCountInput = {
    availableWidth: number
    thumbnailWidths: number[]
    thumbnailGap: number
    countBadgeWidth: number
}

export function getVisibleSidebarThumbnailCount({
    availableWidth,
    thumbnailWidths,
    thumbnailGap,
    countBadgeWidth,
}: VisibleSidebarThumbnailCountInput): number {
    let usedWidth = 0
    let count = 0

    for (const thumbnailWidth of thumbnailWidths) {
        const nextWidth = usedWidth + (count > 0 ? thumbnailGap : 0) + thumbnailWidth

        if (nextWidth > availableWidth) break

        usedWidth = nextWidth
        count += 1
    }

    if (count >= thumbnailWidths.length) {
        return thumbnailWidths.length
    }

    let visibleCount = 0
    usedWidth = 0

    for (const thumbnailWidth of thumbnailWidths) {
        const nextWidth = usedWidth + (visibleCount > 0 ? thumbnailGap : 0) + thumbnailWidth
        const totalWithBadge = nextWidth + thumbnailGap + countBadgeWidth

        if (totalWithBadge > availableWidth) break

        usedWidth = nextWidth
        visibleCount += 1
    }

    return Math.max(0, visibleCount)
}

export function getProjectSidebarMedia(
    project: Project,
    options: ProjectSidebarMediaOptions,
): ProjectSidebarMedia {
    const thumbnails = getProjectThumbnails(project, options)
    const visibleThumbnailCount = options.visibleThumbnailCount ?? thumbnails.length
    const visibleThumbnails = thumbnails.slice(0, visibleThumbnailCount)

    return {
        thumbnails,
        visibleThumbnails,
        hiddenThumbnailCount: Math.max(0, thumbnails.length - visibleThumbnailCount),
    }
}
