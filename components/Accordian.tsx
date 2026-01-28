'use client';

import { useState, useEffect } from 'react';
import AccordionItem from './AccordianItem';
import { Category, Project } from '@/types';

type Section = {
  id: string;
  title: string;
  content: React.FC<any>;
};

interface AccordionProps {
  sections: Section[];
  sectionProps?: Record<string, any>;
  projects: Project[] | null,
  categories: Category[],
  styleUps: any | null
}

export default function Accordion({ sections, sectionProps, projects, categories, styleUps }: AccordionProps) {
  // Start with Work open by default
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id);
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


const handleClick = (sectionId: string, sectionTitle: string) => {
  if (sectionTitle === 'WORK') {
    // WORK is active
    if (activeId === sectionId) {
      // ❗ only close if hint is active
      if (!workHintActive) return;
      setActiveId(null);
    } else {
      setActiveId(sectionId);
    }
    return;
  }

  if (sectionTitle === 'STYLE UPS') {
    setActiveId(activeId === sectionId ? sections[1]?.id : sectionId);
  }
};


  return (
    <div className={activeId === '2' ? 'accordion styleups-active' : 'accordion'}>
{sections.map((section, index) => {
  const SectionComponent = section.content;

  // If this is the Work section, merge projects into props
  const propsForSection = {
    ...sectionProps,
    ...(section.title === 'WORK' ? { projects, categories } : {styleUps}),
  };

  return (
    <AccordionItem
      key={section.id}
      title={section.title}
      isOpen={activeId === section.id}
      hint={index === 0 && workHintActive}
      onClick={() => handleClick(section.id, section.title)}
    >
      <SectionComponent {...propsForSection} />
    </AccordionItem>
  );
})}

    </div>
  );
}