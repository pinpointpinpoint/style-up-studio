'use client';

import AccordionNavItem from "./AccordionNavItem";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import styles from "./Accordion.module.css";

const HEADER_HEIGHT = 35;
const OPEN_HEIGHT = `calc(100vh - ${HEADER_HEIGHT * 2}px)`;

export default function AccordionNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [optimisticRoute, setOptimisticRoute] = useState<string | null>(null);

  const hasFilters = searchParams.toString().length > 0;

  const isWork =
    pathname === "/" ||
    pathname === "/work" ||
    pathname.startsWith("/work/") ||
    hasFilters;

  const isStyleUps = pathname === "/style-ups";
  const visualIsStyleUps = optimisticRoute ? optimisticRoute === "/style-ups" : isStyleUps;
  const visualIsWork = optimisticRoute ? optimisticRoute === "/" : isWork;
  const workHeight = visualIsWork ? OPEN_HEIGHT : HEADER_HEIGHT;
  const styleUpsHeight = visualIsStyleUps ? OPEN_HEIGHT : HEADER_HEIGHT;

  useEffect(() => {
    const root = document.documentElement;
    const topPadding = HEADER_HEIGHT;
    const bottomPadding = visualIsStyleUps ? 0 : HEADER_HEIGHT;

    root.style.setProperty("--site-main-padding-top", `${topPadding}px`);
    root.style.setProperty("--site-main-padding-bottom", `${bottomPadding}px`);

    return () => {
      root.style.removeProperty("--site-main-padding-top");
      root.style.removeProperty("--site-main-padding-bottom");
    };
  }, [visualIsStyleUps]);

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/style-ups");
  }, [router]);

  useEffect(() => {
    setOptimisticRoute(null);
  }, [pathname]);

  const handleNavigate = (route: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    setOptimisticRoute(route);
  };

  return (
    <div className={styles.accordion}>
      <AccordionNavItem
        title="WORK"
        route="/"
        active={visualIsWork}
        height={workHeight}
        onNavigate={handleNavigate("/")}
      />
      <AccordionNavItem
        title="STYLE UPS"
        route="/style-ups"
        active={visualIsStyleUps}
        height={styleUpsHeight}
        onNavigate={handleNavigate("/style-ups")}
      />
    </div>
  );
}
