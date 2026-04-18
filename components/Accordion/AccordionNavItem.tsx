import Link from "next/link";
import { motion } from "framer-motion";
import styles from "./Accordion.module.css";

export default function AccordionNavItem({
  title,
  route,
  active,
  height,
  onNavigate,
}) {
  return (
    <motion.div
      className={`${styles.section} ${active ? styles.open : ""}`}
      initial={false}
      animate={{ height }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={route} className={styles.header} onClick={onNavigate}>
        {title}
      </Link>
    </motion.div>
  );
}
