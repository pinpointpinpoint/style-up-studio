'use client'

import SiteSectionPanel from './SiteSectionPanel'
import {useRouter} from 'next/navigation'
import {lazy, Suspense, useEffect, useState, type MouseEvent, type ReactNode} from 'react'
import type {StyleUpItem} from '@/features/style-ups/components/StyleUps/StyleUps'
import {WorkSection} from '@/features/work/components/WorkSection/WorkSection'
import ArrowIcon from '@/features/site-shell/components/ArrowIcon/ArrowIcon'
import {
    SiteRouteSelectionProvider,
    useSiteRouteSelection,
} from '@/features/site-shell/routing/SiteRouteSelectionProvider'
import DelayedLoadingMessage from '@/shared/components/DelayedLoadingMessage/DelayedLoadingMessage'
import type {Filter, Project} from '@/types'
import type {SidebarFiltersQueryResult} from '@/sanity.types'
import styles from './SiteSectionsAccordion.module.css'

const CLOSED_HEIGHT = 'var(--header-height)'
const OPEN_HEIGHT = `calc(100% - var(--header-height))`
const WORK_HOME_ROUTE = '/'
const STYLE_UPS_ROUTE = '/style-ups'
const loadStyleUps = () =>
    import('@/features/style-ups/components/StyleUps/StyleUps').then(({StyleUps}) => ({
        default: StyleUps,
    }))
const DeferredStyleUps = lazy(loadStyleUps)

type SiteSectionsAccordionProps = {
    children?: ReactNode
    initialProjects: Project[] | null
    initialFilter: Filter
    sidebarFilters: SidebarFiltersQueryResult | null
    styleUps: StyleUpItem[] | null
}

export default function SiteSectionsAccordion({
    children,
    initialProjects,
    initialFilter,
    sidebarFilters,
    styleUps,
}: SiteSectionsAccordionProps) {
    return (
        <SiteRouteSelectionProvider>
            <SiteSectionsAccordionView
                initialProjects={initialProjects}
                initialFilter={initialFilter}
                sidebarFilters={sidebarFilters}
                styleUps={styleUps}
            >
                {children}
            </SiteSectionsAccordionView>
        </SiteRouteSelectionProvider>
    )
}

function SiteSectionsAccordionView({
    children,
    initialProjects,
    initialFilter,
    sidebarFilters,
    styleUps,
}: SiteSectionsAccordionProps) {
    const router = useRouter()
    const {
        activeSection,
        activeProject,
        isProjectDetail,
        routeProjectNotFound,
        routeSection,
        workRoute,
        projectDetailCloseAction,
        handleSectionNavigation,
    } = useSiteRouteSelection()
    const workHeight = activeSection === 'work' ? OPEN_HEIGHT : CLOSED_HEIGHT
    const styleUpsHeight = activeSection === 'style-ups' ? OPEN_HEIGHT : CLOSED_HEIGHT
    const isActiveProjectDetail = activeSection === 'work' && isProjectDetail
    const [hasMountedStyleUps, setHasMountedStyleUps] = useState(activeSection === 'style-ups')
    const shouldMountStyleUps = hasMountedStyleUps || activeSection === 'style-ups'
    const handleStyleUpsNavigation = handleSectionNavigation('style-ups')
    const projectHeaderTitle =
        activeProject?.title || (routeProjectNotFound ? 'PROJECT NOT FOUND' : 'PROJECT')
    const handleWorkNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
        if (
            !isActiveProjectDetail ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
        ) {
            handleSectionNavigation('work')(event)
            return
        }

        if (!projectDetailCloseAction) return

        event.preventDefault()
        projectDetailCloseAction()
    }
    const prepareStyleUps = () => {
        setHasMountedStyleUps(true)
        void loadStyleUps()
    }

    useEffect(() => {
        router.prefetch(WORK_HOME_ROUTE)
        router.prefetch(STYLE_UPS_ROUTE)
    }, [router])

    return (
        <div className={styles.accordion}>
            <SiteSectionPanel
                title="WORK"
                actionContent={
                    isActiveProjectDetail ? (
                        <>
                            <span className={styles.projectHeaderArrow} aria-hidden="true">
                                <ArrowIcon direction="left" />
                            </span>
                            <span>WORK</span>
                        </>
                    ) : undefined
                }
                contextContent={
                    isProjectDetail ? (
                        <span className={styles.projectHeaderContext}>
                            <span className={styles.projectHeaderSeparator}>/</span>
                            <span className={styles.projectHeaderTitle}>{projectHeaderTitle}</span>
                        </span>
                    ) : undefined
                }
                route={isActiveProjectDetail ? WORK_HOME_ROUTE : workRoute}
                active={activeSection === 'work'}
                current={routeSection === 'work' && !isActiveProjectDetail}
                interactive={activeSection === 'style-ups' || isActiveProjectDetail}
                fullHeaderAction={activeSection === 'style-ups'}
                height={workHeight}
                arrowDirection={activeSection === 'style-ups' ? 'down' : undefined}
                onNavigate={handleWorkNavigation}
            >
                <WorkSection
                    initialProjects={initialProjects}
                    initialFilter={initialFilter}
                    sidebarFilters={sidebarFilters}
                />
            </SiteSectionPanel>
            <SiteSectionPanel
                title="STYLE UPS"
                route={STYLE_UPS_ROUTE}
                active={activeSection === 'style-ups'}
                current={routeSection === 'style-ups'}
                interactive={activeSection === 'work'}
                fullHeaderAction
                height={styleUpsHeight}
                arrowDirection={activeSection === 'work' ? 'up' : undefined}
                onNavigate={(event) => {
                    prepareStyleUps()
                    handleStyleUpsNavigation(event)
                }}
                onIntent={prepareStyleUps}
            >
                {shouldMountStyleUps && (
                    <Suspense
                        fallback={
                            <div className={styles.deferredSectionShell}>
                                <div className={styles.deferredSectionMain}>
                                    <DelayedLoadingMessage />
                                </div>
                                <aside className={styles.deferredSectionSidebar} />
                            </div>
                        }
                    >
                        <DeferredStyleUps styleUps={styleUps} />
                    </Suspense>
                )}
            </SiteSectionPanel>
            <div className={styles.routeProbe} hidden aria-hidden="true">
                {children}
            </div>
        </div>
    )
}
