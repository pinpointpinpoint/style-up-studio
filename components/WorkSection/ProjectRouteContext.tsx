'use client'

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { Project } from '@/types'

type ProjectRouteContextValue = {
  routeProject: Project | null
  routeProjectNotFound: boolean
  setRouteProject: (project: Project | null) => void
  setRouteProjectNotFound: () => void
}

const ProjectRouteContext = createContext<ProjectRouteContextValue | null>(null)

export function ProjectRouteProvider({ children }: { children: ReactNode }) {
  const [routeProject, setRouteProject] = useState<Project | null>(null)
  const [routeProjectNotFound, setRouteProjectNotFoundState] = useState(false)
  const updateRouteProject = useCallback((project: Project | null) => {
    setRouteProject(project)
    setRouteProjectNotFoundState(false)
  }, [])
  const setRouteProjectNotFound = useCallback(() => {
    setRouteProject(null)
    setRouteProjectNotFoundState(true)
  }, [])
  const value = useMemo(
    () => ({
      routeProject,
      routeProjectNotFound,
      setRouteProject: updateRouteProject,
      setRouteProjectNotFound,
    }),
    [routeProject, routeProjectNotFound, updateRouteProject, setRouteProjectNotFound],
  )

  return (
    <ProjectRouteContext.Provider value={value}>
      {children}
    </ProjectRouteContext.Provider>
  )
}

export function useProjectRoute() {
  const context = useContext(ProjectRouteContext)

  if (!context) {
    throw new Error('useProjectRoute must be used within ProjectRouteProvider')
  }

  return context
}
