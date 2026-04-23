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
  const { setRouteProject, setRouteProjectNotFound } = useProjectRoute()

  useEffect(() => {
    if (notFound) {
      setRouteProjectNotFound()
    } else {
      setRouteProject(project)
    }

    return () => {
      setRouteProject(null)
    }
  }, [notFound, project, setRouteProject, setRouteProjectNotFound])

  return null
}
