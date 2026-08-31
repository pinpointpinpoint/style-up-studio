import type {Metadata} from 'next'
import {getWorkIndexRouteMetadata} from '../../workIndexRouteMetadata'

type WorkTypeRouteProps = {
    params: Promise<{slug: string}>
}

export async function generateMetadata({params}: WorkTypeRouteProps): Promise<Metadata> {
    const {slug} = await params

    return getWorkIndexRouteMetadata({
        pathname: `/work/type/${slug}`,
        canonical: `/work/type/${slug}`,
    })
}

export default function WorkTypeRoute() {
    return null
}
