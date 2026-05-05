import Link from "next/link";
import { motion, useReducedMotion } from 'motion/react'
import type { MouseEvent, ReactNode } from "react";
import ArrowIcon, { type ArrowDirection } from "../ArrowIcon/ArrowIcon";
import styles from "./SiteSectionsAccordion.module.css";

type SiteSectionPanelProps = {
  title: string
  route: string
  active: boolean
  current: boolean
  height: string | number
  arrowDirection?: ArrowDirection
  children?: ReactNode
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void
}

export default function SiteSectionPanel({
  title,
  route,
  active,
  current,
  height,
  arrowDirection,
  children,
  onNavigate,
}: SiteSectionPanelProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`${styles.section} ${active ? styles.open : ""}`}
      initial={false}
      animate={{ height }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={route}
        className={styles.header}
        onClick={onNavigate}
        aria-current={current ? "page" : undefined}
      >
        <span>{title}</span>
        {arrowDirection && (
          <span className={styles.headerArrow} aria-hidden="true">
            <ArrowIcon direction={arrowDirection} />
          </span>
        )}
      </Link>
      <div
        id={`${title.toLowerCase().replace(/\s+/g, '-')}-panel`}
        className={styles.panel}
        aria-hidden={!active}
        inert={!active ? true : undefined}
      >
        {children}
      </div>
    </motion.div>
  );
}
