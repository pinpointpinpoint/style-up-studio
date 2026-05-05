import {revalidateTag} from 'next/cache'
import {NextResponse, type NextRequest} from 'next/server'
import {
    SANITY_PROJECTS_TAG,
    SANITY_PUBLIC_TAG,
    SANITY_SEO_TAG,
    SANITY_SITE_SHELL_TAG,
    SANITY_STYLE_UPS_TAG,
} from '../../../sanity/lib/cacheTags'

type SanityWebhookBody = {
    _type?: string
    type?: string
}

const PROJECT_REVALIDATE_TAGS = [
    SANITY_PUBLIC_TAG,
    SANITY_PROJECTS_TAG,
    SANITY_SITE_SHELL_TAG,
]
const SITE_SHELL_REVALIDATE_TAGS = [SANITY_PUBLIC_TAG, SANITY_SITE_SHELL_TAG]
const SEO_REVALIDATE_TAGS = [SANITY_PUBLIC_TAG, SANITY_SEO_TAG, SANITY_SITE_SHELL_TAG]
const STYLE_UPS_REVALIDATE_TAGS = [SANITY_PUBLIC_TAG, SANITY_STYLE_UPS_TAG]

const DOCUMENT_TYPE_REVALIDATE_TAGS: Record<string, string[]> = {
    project: PROJECT_REVALIDATE_TAGS,
    projectType: PROJECT_REVALIDATE_TAGS,
    personality: PROJECT_REVALIDATE_TAGS,
    brand: PROJECT_REVALIDATE_TAGS,
    about: SITE_SHELL_REVALIDATE_TAGS,
    contact: SITE_SHELL_REVALIDATE_TAGS,
    settings: SEO_REVALIDATE_TAGS,
    styleup: STYLE_UPS_REVALIDATE_TAGS,
}

export function getSanityRevalidateTags(documentType?: string | null) {
    return documentType ? (DOCUMENT_TYPE_REVALIDATE_TAGS[documentType] ?? []) : []
}

export async function POST(request: NextRequest) {
    const secret =
        request.nextUrl.searchParams.get('secret') ?? request.headers.get('x-revalidate-secret')

    if (!process.env.SANITY_REVALIDATE_SECRET || secret !== process.env.SANITY_REVALIDATE_SECRET) {
        return NextResponse.json({revalidated: false, message: 'Invalid secret'}, {status: 401})
    }

    const body = (await request.json().catch(() => null)) as SanityWebhookBody | null
    const documentType = body?._type ?? body?.type
    const tags = getSanityRevalidateTags(documentType)

    if (!tags.length) {
        return NextResponse.json({
            revalidated: false,
            message: 'Ignored document type',
            documentType,
            tags: [],
        })
    }

    tags.forEach((tag) => revalidateTag(tag, {expire: 0}))

    return NextResponse.json({revalidated: true, documentType, tags})
}
