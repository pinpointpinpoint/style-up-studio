'use client';

import SiteSectionPanel from "./SiteSectionPanel";
import { useRouter } from "next/navigation";
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import type { StyleUpItem } from "@/features/style-ups/components/StyleUps/StyleUps";
import { WorkSection } from "@/features/work/components/WorkSection/WorkSection";
import {
  SiteRouteSelectionProvider,
  useSiteRouteSelection,
} from "@/features/site-shell/routing/SiteRouteSelectionProvider";
import DelayedLoadingMessage from "@/shared/components/DelayedLoadingMessage/DelayedLoadingMessage";
import type { Filter, Project } from "@/types";
import type { SidebarFiltersQueryResult } from "@/sanity.types";
import styles from "./SiteSectionsAccordion.module.css";

const CLOSED_HEIGHT = 'var(--header-height)';
const OPEN_HEIGHT = `calc(100% - var(--header-height))`;
const WORK_HOME_ROUTE = "/";
const STYLE_UPS_ROUTE = "/style-ups";
const loadStyleUps = () =>
  import("@/features/style-ups/components/StyleUps/StyleUps").then(({ StyleUps }) => ({
    default: StyleUps,
  }));
const DeferredStyleUps = lazy(loadStyleUps);

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
  );
}

function SiteSectionsAccordionView({
  children,
  initialProjects,
  initialFilter,
  sidebarFilters,
  styleUps,
}: SiteSectionsAccordionProps) {
  const router = useRouter();
  const {
    activeSection,
    routeSection,
    workRoute,
    handleSectionNavigation,
  } = useSiteRouteSelection();
  const workHeight = activeSection === "work" ? OPEN_HEIGHT : CLOSED_HEIGHT;
  const styleUpsHeight = activeSection === "style-ups" ? OPEN_HEIGHT : CLOSED_HEIGHT;
  const [hasMountedStyleUps, setHasMountedStyleUps] = useState(activeSection === "style-ups");
  const shouldMountStyleUps = hasMountedStyleUps || activeSection === "style-ups";
  const handleStyleUpsNavigation = handleSectionNavigation("style-ups");
  const prepareStyleUps = () => {
    setHasMountedStyleUps(true);
    void loadStyleUps();
  };

  useEffect(() => {
    router.prefetch(WORK_HOME_ROUTE);
    router.prefetch(STYLE_UPS_ROUTE);
  }, [router]);

  return (
    <div className={styles.accordion}>
      <SiteSectionPanel
        title="WORK"
        route={workRoute}
        active={activeSection === "work"}
        current={routeSection === "work"}
        height={workHeight}
        arrowDirection={activeSection === "style-ups" ? "down" : undefined}
        onNavigate={handleSectionNavigation("work")}
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
        active={activeSection === "style-ups"}
        current={routeSection === "style-ups"}
        height={styleUpsHeight}
        arrowDirection={activeSection === "work" ? "up" : undefined}
        onNavigate={(event) => {
          prepareStyleUps();
          handleStyleUpsNavigation(event);
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
  );
}
