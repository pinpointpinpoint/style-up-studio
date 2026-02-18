'use client';

import { useState, useEffect } from 'react';
import AccordionItem from './AccordionItem';
import { Work } from '../Work';
import { StyleUps } from '../StyleUps';
import styles from './Accordion.module.css';

type Section = {
  id: string;
  title: string;
};

interface AccordionProps {
  projects: any | null,
  categories: any | null,
  styleUps: any | null
}

export default function Accordion({ projects, categories, styleUps }: AccordionProps) {
  const [open, setOpen] = useState<"work" | "style" | null>("work");
  const canCloseWork = true;

  const sections: Section[] = [
    { id: '1', title: 'WORK' },
    { id: '2', title: 'STYLE UPS' },
  ];
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id);

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

  const handleClicks = (sectionId: string, sectionTitle: string) => {
    if (sectionTitle === 'WORK') {


      // if work is NOT active AND style ups is active, 
      // slide styles ups section down, to reveal work section

      // if work is NOT active AND style ups is NOT active
      // slide work section up

      // if work is active and workhint is active, then slide work down to

      // WORK is active
      if (activeId === sectionId) {
        // only close if hint is active
        // if (!workHintActive) return;
        setActiveId(null);
      } else {
        setActiveId(sectionId);
      }
      return;
    }

    if (sectionTitle === 'STYLE UPS') {
      // slide style ups section upwards (to cover work and reveal styles ups)
      setActiveId(activeId === sectionId ? sections[1]?.id : sectionId);
    }
  };

  const handleClick = (id: "work" | "style") => {
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
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          pointerEvents: "auto",
        }}
      >
        <AccordionItem
          title="WORK"
          isOpen={open === "work"}
          onClick={() => handleClick("work")}
          isBottom={false}

        >
          <Work projects={projects} categories={categories} />
        </AccordionItem>

        <AccordionItem
          title="STYLE UPS"
          isOpen={open === "style"}
          onClick={() => handleClick("style")}
          isBottom={true}
        >
          <StyleUps styleUps={styleUps} />
        </AccordionItem>
      </div>
    </div>

  );
}