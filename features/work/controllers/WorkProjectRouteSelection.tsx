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
  applyWorkRouteSelectionEvent,
  getWorkRouteSelectionView,
  type ProjectRouteSelection,
} from '@/features/work/lib/workRouteSelection'
import type { Project } from '@/types'

type WorkProjectRouteSelectionContextValue = {
  routeProject: Project | null
  routeProjectNotFound: boolean
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
  const applyRouteProject = useCallback((project: Project | null, notFound: boolean) => {
    setRouteSelection((currentSelection) =>
      applyWorkRouteSelectionEvent({
        state: {
          lastWorkRoute: project?.slug ? `/work/${project.slug}` : '/',
          projectRouteSelection: currentSelection,
        },
        event: {
          type: 'routeProjectLoaded',
          project,
          notFound,
          pathname: project?.slug ? `/work/${project.slug}` : '/',
          searchParams: new URLSearchParams(),
        },
      }).state.projectRouteSelection,
    )
  }, [])
  const clearRouteProjectSelection = useCallback(
    (view: ReturnType<typeof getWorkRouteSelectionView<Project>>) => {
      setRouteSelection((currentSelection) =>
        applyWorkRouteSelectionEvent({
          state: {
            lastWorkRoute: view.nextLastWorkRoute,
            projectRouteSelection: currentSelection,
          },
          event: {
            type: 'inactiveProjectRouteCleared',
            view,
          },
        }).state.projectRouteSelection,
      )
    },
    [],
  )
  const value = useMemo(
    () => ({
      routeProject: routeSelection.project,
      routeProjectNotFound: routeSelection.notFound,
      applyRouteProject,
      clearRouteProjectSelection,
    }),
    [
      routeSelection,
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
