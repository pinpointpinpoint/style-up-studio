import type {Metadata} from 'next'

type WorkTypeRouteProps = {
    params: Promise<{slug: string}>
}

export async function generateMetadata({params}: WorkTypeRouteProps): Promise<Metadata> {
    const {slug} = await params

    return {
        title: 'Work',
        alternates: {
            canonical: `/work/type/${slug}`,
        },
    }
}

export default function WorkTypeRoute() {
    return null
}
