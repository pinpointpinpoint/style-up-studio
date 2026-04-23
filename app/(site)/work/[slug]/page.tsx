import { notFound } from 'next/navigation'
import ProjectRouteBridge from '@/components/WorkSection/ProjectRouteBridge'
import { sanityFetch } from '@/sanity/lib/live'
import { projectBySlugQuery } from '@/sanity/lib/queries'
import type { Project } from '@/types'
import type { Metadata } from 'next'

type ProjectRouteProps = {
  params: Promise<{ slug: string }>
}

async function getProject(slug: string) {
  const { data } = await sanityFetch({
    query: projectBySlugQuery,
    params: { slug },
    stega: false,
  })

  return data
}

export async function generateMetadata({ params }: ProjectRouteProps): Promise<Metadata> {
  const { slug } = await params
  const selectedProject = await getProject(slug)

  return {
    title: selectedProject?.title ?? 'Work',
    alternates: {
      canonical: `/work/${slug}`,
    },
  }
}

export default async function ProjectRoute({ params }: ProjectRouteProps) {
  const { slug } = await params
  const selectedProject = await getProject(slug)

  if (!selectedProject) {
    notFound()
  }

  return <ProjectRouteBridge project={selectedProject as Project} />
}
