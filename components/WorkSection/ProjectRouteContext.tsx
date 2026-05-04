'use client'

import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react'
import {applyProjectRouteBridge, type ProjectRouteSelection} from '@/lib/workRouteSelection'
import type { Project } from '@/types'

type ProjectRouteContextValue = {
  routeProject: Project | null
  routeProjectNotFound: boolean
  setRouteProject: (project: Project | null) => void
  setRouteProjectNotFound: () => void
  applyRouteProject: (project: Project | null, notFound: boolean) => void
}

const ProjectRouteContext = createContext<ProjectRouteContextValue | null>(null)

export function ProjectRouteProvider({ children }: { children: ReactNode }) {
  const [routeSelection, setRouteSelection] = useState<ProjectRouteSelection<Project>>({
    project: null,
    notFound: false,
  })
  const updateRouteProject = useCallback((project: Project | null) => {
    setRouteSelection({project, notFound: false})
  }, [])
  const setRouteProjectNotFound = useCallback(() => {
    setRouteSelection({project: null, notFound: true})
  }, [])
  const applyRouteProject = useCallback((project: Project | null, notFound: boolean) => {
    setRouteSelection((currentSelection) =>
      applyProjectRouteBridge(currentSelection, {project, notFound}),
    )
  }, [])
  const value = useMemo(
    () => ({
      routeProject: routeSelection.project,
      routeProjectNotFound: routeSelection.notFound,
      setRouteProject: updateRouteProject,
      setRouteProjectNotFound,
      applyRouteProject,
    }),
    [routeSelection, updateRouteProject, setRouteProjectNotFound, applyRouteProject],
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
