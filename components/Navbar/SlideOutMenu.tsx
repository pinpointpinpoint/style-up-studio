import { useEffect, useRef } from 'react'
import {AnimatePresence, motion} from 'framer-motion';
import styles from './Navbar.module.css'

interface SlideOutMenuProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  direction?: 'left' | 'right' 
}

export function SlideOutMenu({ isOpen, onClose, children, direction}: SlideOutMenuProps) {
  const initialX = direction === 'right' ? '100%' : '-100%';
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
  if (!isOpen) return;
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [isOpen, onClose]);

  return (
    <AnimatePresence>
      { isOpen && 
        <motion.div
          ref={menuRef}
          initial={{ x: initialX }}
          animate={{ x: 0 }}
          exit={{ x: initialX }}
          transition={{ type: 'tween', duration: 0.3 }}
          className={`${styles.navbarItemContent} ${
            direction === 'left' ? styles.menuLeft : styles.menuRight
          }`}
        >
            {children}
        </motion.div>
    }
    </AnimatePresence>
  )
}
