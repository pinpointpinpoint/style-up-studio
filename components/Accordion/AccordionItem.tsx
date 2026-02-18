"use client";

import { motion, AnimatePresence } from "framer-motion";
import styles from './Accordion.module.css';

const ACCORDION_HEADER = 30;
const HEADER = 80;

export default function AccordionItem({ title, isOpen, onClick, children, isBottom }) {

  const panelHeight =  `calc(100vh - ${HEADER}px - ${2 * ACCORDION_HEADER}px)`;

  return (
    <motion.div 
      layout
      className={styles.item} >
      {/* HEADER */}
      <button onClick={onClick}
      className={styles.header}
        style={{
          background: isOpen ? "black" : "white",
          borderTop: isOpen ? "none" : "1px solid black",
          color: isOpen ? "white" : "black",
          fontSize: 16,
        }} >
        {title}
      </button>
      {/* CONTENT */}
      <AnimatePresence
        initial={false}>
        {isOpen &&
          (<motion.div
            key="content"
            initial={{ height: 0 }}
            animate={{ height: panelHeight }}
            exit={{ height: 0 }} >
            {children}
          </motion.div>)}
      </AnimatePresence>
    </motion.div>);
}