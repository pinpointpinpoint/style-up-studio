'use client';

import SiteSectionPanel from "./SiteSectionPanel";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { StyleUps, type StyleUpItem } from "@/features/style-ups/components/StyleUps/StyleUps";
import { WorkSection } from "@/features/work/components/WorkSection/WorkSection";
import { WorkProjectRouteSelectionProvider } from "@/features/work/controllers/WorkProjectRouteSelection";
import {
  applyWorkRouteSelectionEvent,
  type WorkRouteSelectionState,
  type WorkRouteSection,
} from "@/features/work/lib/workRouteSelection";
import type { Filter, Project } from "@/types";
import type { SidebarFiltersQueryResult } from "@/sanity.types";
import styles from "./SiteSectionsAccordion.module.css";

const CLOSED_HEIGHT = 'var(--header-height)';
const OPEN_HEIGHT = `calc(100% - var(--header-height))`;
const WORK_HOME_ROUTE = "/";
const STYLE_UPS_ROUTE = "/style-ups";

type SiteSection = WorkRouteSection;

type OptimisticSection = {
  section: SiteSection
  pathname: string
}

type AccordionRouteProject = {
  slug?: string | null
}

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [optimisticSection, setOptimisticSection] = useState<OptimisticSection | null>(null);
  const [routeState, setRouteState] = useState<WorkRouteSelectionState<AccordionRouteProject>>({
    lastWorkRoute: WORK_HOME_ROUTE,
    projectRouteSelection: {
      project: null,
      notFound: false,
    },
  });
  const routeResult = applyWorkRouteSelectionEvent({
    state: routeState,
    event: {
      type: "routeChanged",
      pathname,
      searchParams,
    },
  });
  const routeSelection = routeResult.view;
  const routeSection = routeSelection.routeSection;
  const activeSection =
    optimisticSection?.pathname === pathname ? optimisticSection.section : routeSection;
  const workHeight = activeSection === "work" ? OPEN_HEIGHT : CLOSED_HEIGHT;
  const styleUpsHeight = activeSection === "style-ups" ? OPEN_HEIGHT : CLOSED_HEIGHT;
  const visibleWorkRoute = routeSelection.visibleWorkRoute;
  const workRoute =
    routeSection === "work" ? routeSelection.nextLastWorkRoute : routeState.lastWorkRoute;

  useEffect(() => {
    router.prefetch(WORK_HOME_ROUTE);
    router.prefetch(STYLE_UPS_ROUTE);
  }, [router]);

  const handleNavigate = (section: SiteSection) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    const result = applyWorkRouteSelectionEvent({
      state: routeState,
      event: {
        type: "sectionNavigationStarted",
        section,
        pathname,
        searchParams,
      },
    });

    setRouteState(result.state);
    setOptimisticSection(result.optimisticSection);
  };

  return (
    <WorkProjectRouteSelectionProvider>
      <div className={styles.accordion}>
        <SiteSectionPanel
          title="WORK"
          route={workRoute}
          active={activeSection === "work"}
          current={routeSection === "work"}
          height={workHeight}
          arrowDirection={activeSection === "style-ups" ? "down" : undefined}
          onNavigate={handleNavigate("work")}
        >
          <WorkSection
            initialProjects={initialProjects}
            initialFilter={initialFilter}
            sidebarFilters={sidebarFilters}
            activeWorkRoute={visibleWorkRoute}
          />
        </SiteSectionPanel>
        <SiteSectionPanel
          title="STYLE UPS"
          route={STYLE_UPS_ROUTE}
          active={activeSection === "style-ups"}
          current={routeSection === "style-ups"}
          height={styleUpsHeight}
          arrowDirection={activeSection === "work" ? "up" : undefined}
          onNavigate={handleNavigate("style-ups")}
        >
          <StyleUps styleUps={styleUps} />
        </SiteSectionPanel>
        <div className={styles.routeProbe} hidden aria-hidden="true">
          {children}
        </div>
      </div>
    </WorkProjectRouteSelectionProvider>
  );
}
