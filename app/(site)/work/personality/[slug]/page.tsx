import type {Metadata} from 'next'

type WorkPersonalityRouteProps = {
    params: Promise<{slug: string}>
}

export async function generateMetadata({params}: WorkPersonalityRouteProps): Promise<Metadata> {
    const {slug} = await params

    return {
        title: 'Work',
        alternates: {
            canonical: `/work/personality/${slug}`,
        },
    }
}

export default function WorkPersonalityRoute() {
    return null
}
