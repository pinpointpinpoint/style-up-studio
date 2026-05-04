import {notFound} from 'next/navigation'
import ProjectRouteBridge from '@/components/WorkSection/ProjectRouteBridge'
import {getProjectBySlug} from '@/app/(site)/actions'
import type {Metadata} from 'next'

type ProjectRouteProps = {
    params: Promise<{slug: string}>
}

export async function generateMetadata({params}: ProjectRouteProps): Promise<Metadata> {
    const {slug} = await params
    const selectedProject = await getProjectBySlug(slug)

    return {
        title: selectedProject?.title ?? 'Work',
        alternates: {
            canonical: `/work/${slug}`,
        },
    }
}

export default async function ProjectRoute({params}: ProjectRouteProps) {
    const {slug} = await params
    const selectedProject = await getProjectBySlug(slug)

    if (!selectedProject) {
        notFound()
    }

    return <ProjectRouteBridge project={selectedProject} />
}
