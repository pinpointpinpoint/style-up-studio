'use client';

import {OptimisticSortOrder} from '@/components/OptimisticSortOrder'
import type {SettingsQueryResult} from '@/sanity.types'
import {studioUrl} from '@/sanity/lib/api'
import {resolveHref} from '@/sanity/lib/utils'
import {createDataAttribute, stegaClean} from 'next-sanity'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {AnimatePresence, motion} from 'framer-motion';

// interface NavbarProps {
//   data: SettingsQueryResult
// }

interface SlideOutMenuProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  direction?: 'left' | 'right'  // default to right
}

// function SlideOutMenu({ isOpen, children}: SlideOutMenuProps) {
//   return (
//     <div className={`top-0 ${isOpen ? 'left-0' : 'left-[100vw]'} absolute z-100 bg-white h-full w-screen p-4 flex items-center justify-between`}>
//       {children}    
//     </div>
//   )
// }

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
          className={`nav__item-content ${
            direction === 'left' ? 'left-0' : 'right-0'
          }`}
        >
            {children}
        </motion.div>
    }
    </AnimatePresence>
  )
}


export function Navbar(/*props: NavbarProps*/) {
    const [isCollapsed, setIsCollapsed] = useState<Boolean>(false);

  const collapseNav = () => {
    setIsCollapsed(true);
  }

  // const {data} = props
  // const dataAttribute =
  //   data?._id && data?._type
  //     ? createDataAttribute({
  //         baseUrl: studioUrl,
  //         id: data._id,
  //         type: data._type,
  //       })
  //     : null

  const [openMenu, setOpenMenu] = useState<'about' | 'contact' | null>(null);

  const closeMenu = () => {
    setOpenMenu(null)
  }

  return (
    <header className='nav'>
      <div className='nav__item'>
        <button onClick={() => setOpenMenu(openMenu === 'about' ? null : 'about')}><h1>ABOUT →</h1></button>
        <SlideOutMenu isOpen={openMenu === 'about'} direction="left" onClose={closeMenu}>
          <div className='flex justify-between w-full'>
              <div className='text-[12px] w-1/2 text-left'>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolore, at. Voluptas reiciendis fugiat voluptatum iusto omnis.</div>
              <button onClick={closeMenu}>ABOUT ←</button>
          </div>
        </SlideOutMenu>
      </div>
      <a href="/"><img className='nav__logo' alt="Style Up Studio" width="400px" src="logo_vertical.png"/></a>
      <div className='nav__item'>
        <button onClick={() => setOpenMenu(openMenu === 'contact' ? null : 'contact')}><h1>← CONTACT</h1></button>
        <SlideOutMenu isOpen={openMenu === 'contact'} direction="right" onClose={closeMenu}>
          <div className='flex justify-between w-full'>
            <button onClick={closeMenu}>CONTACT →</button>
            <div className="flex gap-20 text-right text-[12px]">
              <div className='flex flex-col'>
                <div>Email:</div>
                <div>Instagram:</div>
              </div>
              <div className='flex flex-col'>
                <a href="mailto:angie.jayasinghe@gmail.com" target="_blank">angie.jayasinghe@gmail.com</a>
                <a href="https://instagram.com/bby_aj" target="_blank">@bby_aj</a>
              </div>
            </div>
          </div>
        </SlideOutMenu>      
      </div>
    </header>
    // <header
    //   className="sticky top-0 z-10 flex flex-wrap items-center gap-x-5 bg-white/80 px-4 py-4 backdrop-blur md:px-16 md:py-5 lg:px-32"
    //   data-sanity={dataAttribute?.('menuItems')}
    // >
    //   <OptimisticSortOrder id={data?._id} path="menuItems">
    //     {data?.menuItems?.map((menuItem) => {
    //       const href = resolveHref(menuItem?._type, menuItem?.slug)
    //       if (!href) {
    //         return null
    //       }
    //       return (
    //         <Link
    //           key={menuItem._key}
    //           className={`text-lg hover:text-black md:text-xl ${
    //             menuItem?._type === 'home' ? 'font-extrabold text-black' : 'text-gray-600'
    //           }`}
    //           data-sanity={dataAttribute?.([
    //             'menuItems',
    //             {_key: menuItem._key as unknown as string},
    //           ])}
    //           href={href}
    //         >
    //           {stegaClean(menuItem.title)}
    //         </Link>
    //       )
    //     })}
    //   </OptimisticSortOrder>
    // </header>



  )
}
