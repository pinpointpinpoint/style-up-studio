import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";
import styles from "./Accordion.module.css";

type AccordionNavItemProps = {
  title: string
  route: string
  active: boolean
  current: boolean
  height: string | number
  children?: ReactNode
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void
}

export default function AccordionNavItem({
  title,
  route,
  active,
  current,
  height,
  children,
  onNavigate,
}: AccordionNavItemProps) {
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
        {title}
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
