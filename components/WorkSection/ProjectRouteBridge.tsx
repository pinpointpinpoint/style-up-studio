'use client'

import { useEffect } from 'react'
import type { Project } from '@/types'
import { useProjectRoute } from './ProjectRouteContext'

type ProjectRouteBridgeProps = {
  project?: Project | null
  notFound?: boolean
}

export default function ProjectRouteBridge({
  project = null,
  notFound = false,
}: ProjectRouteBridgeProps) {
  const { applyRouteProject } = useProjectRoute()

  useEffect(() => {
    applyRouteProject(project, notFound)
  }, [applyRouteProject, notFound, project])

  return null
}
