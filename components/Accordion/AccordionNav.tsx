'use client';

import AccordionNavItem from "./AccordionNavItem";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { StyleUps, type StyleUpItem } from "@/components/StyleUps/StyleUps";
import { WorkSection } from "@/components/WorkSection/WorkSection";
import { ProjectRouteProvider } from "@/components/WorkSection/ProjectRouteContext";
import type { Filter, Project } from "@/types";
import type { SidebarFiltersQueryResult } from "@/sanity.types";
import styles from "./Accordion.module.css";

const CLOSED_HEIGHT = 'var(--header-height)';
const OPEN_HEIGHT = `calc(100% - var(--header-height))`;
const WORK_HOME_ROUTE = "/";
const STYLE_UPS_ROUTE = "/style-ups";

type AccordionSection = 'work' | 'style-ups';

type AccordionNavProps = {
  children?: ReactNode
  initialProjects: Project[] | null
  initialFilter: Filter
  sidebarFilters: SidebarFiltersQueryResult | null
  styleUps: StyleUpItem[] | null
}

function getActiveSection(pathname: string): AccordionSection {
  return pathname === STYLE_UPS_ROUTE || pathname.startsWith(`${STYLE_UPS_ROUTE}/`)
    ? "style-ups"
    : "work";
}

export default function AccordionNav({
  children,
  initialProjects,
  initialFilter,
  sidebarFilters,
  styleUps,
}: AccordionNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeSection = getActiveSection(pathname);
  const [optimisticSection, setOptimisticSection] = useState<AccordionSection | null>(null);
  const [lastWorkRoute, setLastWorkRoute] = useState(WORK_HOME_ROUTE);
  const activeSection = optimisticSection ?? routeSection;
  const workHeight = activeSection === "work" ? OPEN_HEIGHT : CLOSED_HEIGHT;
  const styleUpsHeight = activeSection === "style-ups" ? OPEN_HEIGHT : CLOSED_HEIGHT;
  const currentRoute = useMemo(() => {
    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  }, [pathname, searchParams]);
  const visibleWorkRoute = routeSection === "work" ? currentRoute : lastWorkRoute;

  useEffect(() => {
    router.prefetch(WORK_HOME_ROUTE);
    router.prefetch(STYLE_UPS_ROUTE);
  }, [router]);

  useEffect(() => {
    setOptimisticSection(null);
  }, [pathname]);

  useEffect(() => {
    if (routeSection === "work") {
      setLastWorkRoute(currentRoute || "/");
    }
  }, [currentRoute, pathname, routeSection]);

  const handleNavigate = (section: AccordionSection) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    setOptimisticSection(section === routeSection ? null : section);
  };

  return (
    <ProjectRouteProvider>
      <div className={styles.accordion}>
        <AccordionNavItem
          title="WORK"
          route={lastWorkRoute}
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
        </AccordionNavItem>
        <AccordionNavItem
          title="STYLE UPS"
          route={STYLE_UPS_ROUTE}
          active={activeSection === "style-ups"}
          current={routeSection === "style-ups"}
          height={styleUpsHeight}
          arrowDirection={activeSection === "work" ? "up" : undefined}
          onNavigate={handleNavigate("style-ups")}
        >
          <StyleUps styleUps={styleUps} />
        </AccordionNavItem>
        <div className={styles.routeProbe} hidden aria-hidden="true">
          {children}
        </div>
      </div>
    </ProjectRouteProvider>
  );
}
