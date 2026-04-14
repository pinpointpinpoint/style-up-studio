'use client';

import { useState, useEffect } from 'react';
import AccordionItem from './AccordionItem';
import { WorkSection } from '../WorkSection/WorkSection';
import { StyleUps } from '../StyleUps';
import styles from './Accordion.module.css';
import { useAccordionQuery } from '@/hooks/useAccordionQuery';

interface AccordionProps {
  featuredProjects: any | null,
  projectTypes: any | null,
  styleUps: any | null
}

export default function Accordion({ featuredProjects, projectTypes, styleUps }: AccordionProps) {
  const [open, setOpen] = useAccordionQuery("work");
  const canCloseWork = true;

  // STYLE THEM UPS EASTER EGG 
  const [workHintActive, setWorkHintActive] = useState(false);

  useEffect(() => {
    // 40% chance the hint ever appears this visit
    if (Math.random() > 0.4) return;

    const minDelay = 4000;  // 4s
    const maxDelay = 20000; // 20s

    const delay =
      Math.random() * (maxDelay - minDelay) + minDelay;

    const timeout = setTimeout(() => {
      setWorkHintActive(true);

      // bounce only briefly
      setTimeout(() => {
        setWorkHintActive(false);
      }, 1200); // bounce duration
    }, delay);

    return () => clearTimeout(timeout);
  }, []);

  // DEV: also trigger hint on "h" key press
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'h') {
        setWorkHintActive(true);
        setTimeout(() => setWorkHintActive(false), 1200);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleClick = (id: "work" | "style") => {
    setOpen(open === id ? null : id);

    if (id === "style") {
      setOpen("style");
      return;
    }

    if (id === "work") {
      if (open === "work" && canCloseWork) {
        setOpen(null);
        return;
      }
      setOpen("work");
    }
  };

  return (
    <div
      className={styles.accordion}
    >
      <AccordionItem
        title={`WORK ${open === null ? "↑" : open === "work" ? "" : "↓"}`}
        isOpen={open === "work"}
        onClick={() => handleClick("work")}
        isBottom={false}
      >
        <WorkSection projects={featuredProjects} projectTypes={projectTypes} />
      </AccordionItem>

      <AccordionItem
        title={open === "style" ? "STYLE UPS" : "STYLE UPS ↑"}
        isOpen={open === "style"}
        onClick={() => handleClick("style")}
        isBottom={true}
      >
        <StyleUps styleUps={styleUps} />
      </AccordionItem>
    </div>
  );
}