import type {Metadata} from 'next'
import {getWorkIndexRouteMetadata} from '../../workIndexRouteMetadata'

type WorkPersonalityRouteProps = {
    params: Promise<{slug: string}>
}

export async function generateMetadata({params}: WorkPersonalityRouteProps): Promise<Metadata> {
    const {slug} = await params

    return getWorkIndexRouteMetadata({
        pathname: `/work/personality/${slug}`,
        canonical: `/work/personality/${slug}`,
    })
}

export default function WorkPersonalityRoute() {
    return null
}
