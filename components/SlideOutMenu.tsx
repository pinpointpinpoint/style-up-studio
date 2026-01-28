'use client'

import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

interface SlideOutMenuProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  direction?: 'left' | 'right'
}

export const SlideOutMenu: React.FC<SlideOutMenuProps> = ({
  isOpen,
  onClose,
  children,
  direction = 'right',
}) => {
  const initialX = direction === 'right' ? '100%' : '-100%'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            className={`fixed top-0 h-full w-80 bg-white z-50 shadow-lg flex flex-col p-4 ${
              direction === 'left' ? 'left-0 border-r' : 'right-0 border-l'
            }`}
            initial={{ x: initialX }}
            animate={{ x: 0 }}
            exit={{ x: initialX }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <button
              onClick={onClose}
              className="mb-4 self-end text-sm font-semibold"
            >
              CLOSE ✕
            </button>

            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}