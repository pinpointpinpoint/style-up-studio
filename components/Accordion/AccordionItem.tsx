"use client";

import { motion, AnimatePresence } from "framer-motion";
import styles from './Accordion.module.css';
import { useState } from "react";

const ACCORDION_HEADER = 30;
const HEADER = 30;

export default function AccordionItem({ title, isOpen, onClick, children, isBottom }) {

  const [isAnimating, setIsAnimating] = useState(false);

  const panelHeight =  `calc(100vh - ${HEADER}px - ${2 * ACCORDION_HEADER}px)`;

  return (
    <motion.div 
      // layout="position"
      className={styles.item} >
      {/* HEADER */}
      <button onClick={onClick}
      className={`${styles.header} ${isOpen ? styles.active : ""}`}
      >
        {title}
      </button>
      {/* CONTENT */}
      {/* <AnimatePresence
        initial={false}> */}
          <motion.div
            onAnimationStart={() => setIsAnimating(true)}
            onAnimationComplete={() => setIsAnimating(false)}
            key="content"
            initial={false}
            // animate={{ height: panelHeight }}
        style={{
          overflow: "hidden",
          // height: isOpen ? panelHeight : 0,
          minHeight: 0,
          pointerEvents: isAnimating ? "none" : "auto"
        }}
        animate={{
          height: isOpen ? panelHeight : 0,
        }}
            transition={{
              height: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }
            }}
            exit={{ height: 0 }} >
            {children}
          </motion.div>
      {/* </AnimatePresence> */}
    </motion.div>);
}


// export default function AccordionItem({
//   title,
//   isOpen,
//   onClick,
//   children,
//   isBottom
// }) {
//   const panelHeight = `calc(100vh - ${HEADER}px - ${2 * ACCORDION_HEADER}px)`;

//   return (
//     <motion.div layout="position" className={styles.item}>
//       <button
//         onClick={onClick}
//         className={styles.header}
//         style={{
//           background: isOpen ? "black" : "white",
//           borderTop: isOpen ? "none" : "1px solid black",
//           color: isOpen ? "white" : "black",
//         }}
//       >
//         {title}
//       </button>

//       <motion.div
//         style={{
//           height: isOpen ? panelHeight : 0,
//           overflow: "hidden",
//         }}
//         transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
//       >
//         {children}
//       </motion.div>
//     </motion.div>
//   );
// }

