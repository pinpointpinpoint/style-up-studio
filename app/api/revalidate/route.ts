import {revalidateTag} from 'next/cache'
import {NextResponse, type NextRequest} from 'next/server'
import {SANITY_PROJECTS_TAG} from '@/sanity/lib/fetch'

type SanityWebhookBody = {
    _type?: string
    type?: string
}

export async function POST(request: NextRequest) {
    const secret =
        request.nextUrl.searchParams.get('secret') ?? request.headers.get('x-revalidate-secret')

    if (!process.env.SANITY_REVALIDATE_SECRET || secret !== process.env.SANITY_REVALIDATE_SECRET) {
        return NextResponse.json({revalidated: false, message: 'Invalid secret'}, {status: 401})
    }

    const body = (await request.json().catch(() => null)) as SanityWebhookBody | null
    const documentType = body?._type ?? body?.type

    if (documentType && documentType !== 'project') {
        return NextResponse.json({revalidated: false, message: 'Ignored document type'})
    }

    revalidateTag(SANITY_PROJECTS_TAG, {expire: 0})

    return NextResponse.json({revalidated: true, tag: SANITY_PROJECTS_TAG})
}
