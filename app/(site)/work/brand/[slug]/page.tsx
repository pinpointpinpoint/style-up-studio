import type {Metadata} from 'next'
import {getWorkIndexRouteMetadata} from '../../workIndexRouteMetadata'

type WorkBrandRouteProps = {
    params: Promise<{slug: string}>
}

export async function generateMetadata({params}: WorkBrandRouteProps): Promise<Metadata> {
    const {slug} = await params

    return getWorkIndexRouteMetadata({
        pathname: `/work/brand/${slug}`,
        canonical: `/work/brand/${slug}`,
    })
}

export default function WorkBrandRoute() {
    return null
}
