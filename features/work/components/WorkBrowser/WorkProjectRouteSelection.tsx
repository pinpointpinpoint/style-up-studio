'use client'

import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react'
import {
  applyWorkProjectRouteSelection,
  clearInactiveProjectRouteSelection,
  getWorkRouteSelectionView,
  type ProjectRouteSelection,
} from '@/features/work/lib/workRouteSelection'
import type { Project } from '@/types'

type WorkProjectRouteSelectionContextValue = {
  routeProject: Project | null
  routeProjectNotFound: boolean
  setRouteProject: (project: Project | null) => void
  setRouteProjectNotFound: () => void
  applyRouteProject: (project: Project | null, notFound: boolean) => void
  clearRouteProjectSelection: (view: ReturnType<typeof getWorkRouteSelectionView<Project>>) => void
}

const WorkProjectRouteSelectionContext =
  createContext<WorkProjectRouteSelectionContextValue | null>(null)

export function WorkProjectRouteSelectionProvider({ children }: { children: ReactNode }) {
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
      applyWorkProjectRouteSelection(currentSelection, {project, notFound}),
    )
  }, [])
  const clearRouteProjectSelection = useCallback(
    (view: ReturnType<typeof getWorkRouteSelectionView<Project>>) => {
      setRouteSelection((currentSelection) =>
        clearInactiveProjectRouteSelection({
          view,
          projectRouteSelection: currentSelection,
        }),
      )
    },
    [],
  )
  const value = useMemo(
    () => ({
      routeProject: routeSelection.project,
      routeProjectNotFound: routeSelection.notFound,
      setRouteProject: updateRouteProject,
      setRouteProjectNotFound,
      applyRouteProject,
      clearRouteProjectSelection,
    }),
    [
      routeSelection,
      updateRouteProject,
      setRouteProjectNotFound,
      applyRouteProject,
      clearRouteProjectSelection,
    ],
  )

  return (
    <WorkProjectRouteSelectionContext.Provider value={value}>
      {children}
    </WorkProjectRouteSelectionContext.Provider>
  )
}

export function useWorkProjectRouteSelection() {
  const context = useContext(WorkProjectRouteSelectionContext)

  if (!context) {
    throw new Error(
      'useWorkProjectRouteSelection must be used within WorkProjectRouteSelectionProvider',
    )
  }

  return context
}
