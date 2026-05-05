'use client'

import { useEffect } from 'react'
import type { Project } from '@/types'
import { useWorkProjectRouteSelection } from './WorkProjectRouteSelection'

type WorkProjectRouteLoaderProps = {
  project?: Project | null
  notFound?: boolean
}

export default function WorkProjectRouteLoader({
  project = null,
  notFound = false,
}: WorkProjectRouteLoaderProps) {
  const { applyRouteProject } = useWorkProjectRouteSelection()

  useEffect(() => {
    applyRouteProject(project, notFound)
  }, [applyRouteProject, notFound, project])

  return null
}
