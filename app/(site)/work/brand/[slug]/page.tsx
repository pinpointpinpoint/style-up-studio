import type {Metadata} from 'next'

type WorkBrandRouteProps = {
    params: Promise<{slug: string}>
}

export async function generateMetadata({params}: WorkBrandRouteProps): Promise<Metadata> {
    const {slug} = await params

    return {
        title: 'Work',
        alternates: {
            canonical: `/work/brand/${slug}`,
        },
    }
}

export default function WorkBrandRoute() {
    return null
}
