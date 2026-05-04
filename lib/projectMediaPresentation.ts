import type {Project, SanityAsset} from '@/types'

type ProjectImage = NonNullable<Project['coverImage']>
type ProjectMediaItem = Project['media'][number]
type ProjectMediaImage = Extract<ProjectMediaItem, {_type: 'image'}>
type ProjectUploadedVideo = Extract<ProjectMediaItem, {_type: 'uploadedVideo'}>
type ProjectExternalVideo = Extract<ProjectMediaItem, {_type: 'videoUrl'}>

export type ProjectImagePreset = 'card' | 'detail' | `thumbnail-${number}` | 'video-poster'

export type ProjectImageUrlResolver = (
    source: ProjectImage | ProjectMediaImage,
    preset: ProjectImagePreset,
) => string | null | undefined

export type ProjectPresentedImage = {
    url: string
    alt: string
}

export type ProjectCardMedia = {
    cardImage: ProjectPresentedImage | null
    hoverImages: ProjectPresentedImage[]
    previewVideoUrl: string | null
}

export type ProjectDetailImageMedia = ProjectPresentedImage & {
    kind?: 'image'
    key: string
    mediaIndex: number
    eager: boolean
}

export type ProjectDetailUploadedVideoMedia = {
    kind: 'uploadedVideo'
    key: string
    mediaIndex: number
    asset: SanityAsset
    fileUrl: string
    poster: string | undefined
    title: string | undefined
}

export type ProjectDetailExternalVideoMedia = {
    kind: 'videoUrl'
    key: string
    mediaIndex: number
    asset: SanityAsset
    url: string
    poster: string | undefined
    title: string | undefined
}

export type ProjectDetailMedia =
    | (ProjectDetailImageMedia & {kind: 'image'})
    | ProjectDetailUploadedVideoMedia
    | ProjectDetailExternalVideoMedia

export type ProjectImageThumbnail = ProjectPresentedImage & {
    kind?: 'image'
    key: string
    mediaIndex: number
}

export type ProjectUploadedVideoThumbnail = ProjectPresentedImage & {
    kind: 'uploadedVideo'
    key: string
    mediaIndex: number
}

export type ProjectExternalVideoThumbnail = ProjectPresentedImage & {
    kind: 'videoUrl'
    key: string
    mediaIndex: number
}

export type ProjectThumbnail =
    | (ProjectImageThumbnail & {kind: 'image'})
    | ProjectUploadedVideoThumbnail
    | ProjectExternalVideoThumbnail

type ProjectMediaPresentationOptions = {
    imageUrl: ProjectImageUrlResolver
    externalVideoPosterUrl?: (url: string) => string | null | undefined
}

type ProjectThumbnailPresentationOptions = ProjectMediaPresentationOptions & {
    externalVideoThumbnailUrl?: (
        url: string,
        preset: `thumbnail-${number}`,
    ) => string | null | undefined
    thumbnailHeight: number
}

function getAssetRef(image: ProjectImage | ProjectMediaImage | null | undefined) {
    return image?.asset?._ref
}

function toPresentedImage(
    source: ProjectImage | ProjectMediaImage | null | undefined,
    alt: string,
    imageUrl: ProjectImageUrlResolver,
    preset: ProjectImagePreset = 'card',
): ProjectPresentedImage | null {
    if (!source) return null

    const url = imageUrl(source, preset)
    return url ? {url, alt} : null
}

export function getProjectCardMedia(
    project: Project,
    options: ProjectMediaPresentationOptions,
): ProjectCardMedia {
    const imageUrl = options.imageUrl
    const projectTitle = project.title ?? 'project'
    const coverAssetRef = getAssetRef(project.coverImage)
    const cardImage = toPresentedImage(
        project.coverImage,
        `Cover image for ${projectTitle}`,
        imageUrl,
    )
    const mediaImages = project.media.filter(
        (item): item is ProjectMediaImage => item._type === 'image',
    )
    const hoverImages = mediaImages
        .filter((image) => getAssetRef(image) !== coverAssetRef)
        .map((image) => toPresentedImage(image, `Gallery image for ${projectTitle}`, imageUrl))
        .filter((image): image is ProjectPresentedImage => Boolean(image))

    return {
        cardImage,
        hoverImages,
        previewVideoUrl: project.previewUrl,
    }
}

export function getProjectDetailImageMedia(
    project: Project,
    options: ProjectMediaPresentationOptions,
): ProjectDetailImageMedia[] {
    const imageUrl = options.imageUrl
    const projectTitle = project.title ?? 'project'

    return project.media
        .map((item, mediaIndex) => {
            if (item._type !== 'image') return null

            const image = toPresentedImage(
                item,
                `Project image ${mediaIndex + 1} for ${projectTitle}`,
                imageUrl,
                'detail',
            )

            if (!image) return null

            return {
                key: item._key ?? item.asset?._ref ?? String(mediaIndex),
                mediaIndex,
                eager: mediaIndex === 0,
                ...image,
            }
        })
        .filter((item): item is ProjectDetailImageMedia => Boolean(item))
}

function getUploadedVideoPoster(item: ProjectUploadedVideo, imageUrl: ProjectImageUrlResolver) {
    return item.thumbnail ? (imageUrl(item.thumbnail, 'video-poster') ?? undefined) : undefined
}

function getExternalVideoPoster(
    item: ProjectExternalVideo,
    options: ProjectMediaPresentationOptions,
) {
    if (item.thumbnail) return options.imageUrl(item.thumbnail, 'video-poster') ?? undefined
    if (!item.url) return undefined

    return options.externalVideoPosterUrl?.(item.url) ?? undefined
}

export function getProjectDetailMedia(
    project: Project,
    options: ProjectMediaPresentationOptions,
): ProjectDetailMedia[] {
    const imageUrl = options.imageUrl
    const imageMediaByIndex = new Map(
        getProjectDetailImageMedia(project, options).map((item) => [item.mediaIndex, item]),
    )

    return project.media
        .map((item, mediaIndex) => {
            if (item._type === 'image') {
                const image = imageMediaByIndex.get(mediaIndex)

                return image ? {...image, kind: 'image' as const} : null
            }

            if (item._type === 'uploadedVideo') {
                if (!item.fileUrl) return null
                const poster = getUploadedVideoPoster(item, imageUrl)
                const uploadedVideoMedia: ProjectDetailUploadedVideoMedia = {
                    kind: 'uploadedVideo',
                    key: item._key ?? `uploaded-video-${mediaIndex}`,
                    mediaIndex,
                    asset: {
                        value: {
                            fileUrl: item.fileUrl,
                            poster,
                        },
                    },
                    fileUrl: item.fileUrl,
                    poster,
                    title: item.title ?? undefined,
                }

                return uploadedVideoMedia
            }

            if (item._type === 'videoUrl') {
                if (!item.url) return null
                const poster = getExternalVideoPoster(item, options)
                const externalVideoMedia: ProjectDetailExternalVideoMedia = {
                    kind: 'videoUrl',
                    key: item._key ?? `video-url-${mediaIndex}`,
                    mediaIndex,
                    asset: {
                        value: {
                            url: item.url,
                            poster,
                        },
                    },
                    url: item.url,
                    poster,
                    title: item.title ?? undefined,
                }

                return externalVideoMedia
            }

            return null
        })
        .filter((item): item is ProjectDetailMedia => Boolean(item))
}

export function getProjectImageThumbnails(
    project: Project,
    options: ProjectThumbnailPresentationOptions,
): ProjectImageThumbnail[] {
    const imageUrl = options.imageUrl
    const projectTitle = project.title ?? 'project'
    const preset = `thumbnail-${options.thumbnailHeight}` as const

    return project.media
        .map((item, mediaIndex) => {
            if (item._type !== 'image') return null

            const image = toPresentedImage(
                item,
                `Gallery thumbnail for ${projectTitle}`,
                imageUrl,
                preset,
            )

            if (!image) return null

            return {
                key: item._key ?? item.asset?._ref ?? String(mediaIndex),
                mediaIndex,
                ...image,
            }
        })
        .filter((item): item is ProjectImageThumbnail => Boolean(item))
}

export function getProjectThumbnails(
    project: Project,
    options: ProjectThumbnailPresentationOptions,
): ProjectThumbnail[] {
    const imageUrl = options.imageUrl
    const projectTitle = project.title ?? 'project'
    const preset = `thumbnail-${options.thumbnailHeight}` as const
    const imageThumbnailsByIndex = new Map(
        getProjectImageThumbnails(project, options).map((item) => [item.mediaIndex, item]),
    )

    return project.media
        .map((item, mediaIndex) => {
            if (item._type === 'image') {
                const image = imageThumbnailsByIndex.get(mediaIndex)

                return image ? {...image, kind: 'image' as const} : null
            }

            if (item._type === 'uploadedVideo') {
                if (!item.thumbnail) return null

                const url = imageUrl(item.thumbnail, preset)
                if (!url) return null

                return {
                    kind: 'uploadedVideo' as const,
                    key: item._key ?? `uploaded-video-${mediaIndex}`,
                    mediaIndex,
                    url,
                    alt: `Video thumbnail ${mediaIndex + 1} for ${projectTitle}`,
                }
            }

            if (item._type === 'videoUrl') {
                if (!item.url) return null

                const url = item.thumbnail
                    ? imageUrl(item.thumbnail, preset)
                    : options.externalVideoThumbnailUrl?.(item.url, preset)

                if (!url) return null

                return {
                    kind: 'videoUrl' as const,
                    key: item._key ?? `video-url-${mediaIndex}`,
                    mediaIndex,
                    url,
                    alt: `Video link thumbnail ${mediaIndex + 1} for ${projectTitle}`,
                }
            }

            return null
        })
        .filter((item): item is ProjectThumbnail => Boolean(item))
}
