'use client';

import { useState } from 'react'
import { SlideOutMenu } from './SlideOutMenu';

// interface NavbarProps {
//   data: SettingsQueryResult
// }

export function Navbar(/*props: NavbarProps*/) {
    const [isCollapsed, setIsCollapsed] = useState<Boolean>(false);

  const collapseNav = () => {
    setIsCollapsed(true);
  }

  const [openMenu, setOpenMenu] = useState<'about' | 'contact' | null>(null);

  const closeMenu = () => {
    setOpenMenu(null)
  }

  return (
    <header className='nav'>
      <div className='nav__item'>
        <button onClick={() => setOpenMenu(openMenu === 'about' ? null : 'about')}><h1>ABOUT</h1></button>
        <SlideOutMenu isOpen={openMenu === 'about'} direction="left" onClose={closeMenu}>
          <div className='flex justify-between w-full'>
              <p className='text-[12px] flex items-center w-1/2 text-left'>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolore, at. Voluptas reiciendis fugiat voluptatum iusto omnis.</p>
              <button onClick={closeMenu}><h1>ABOUT</h1></button>
          </div>
        </SlideOutMenu>
      </div>
      <a href="/"><img className='nav__logo' alt="Style Up Studio" width="150px" src="minimal_logo.svg"/></a>
      <div className='nav__item'>
        <button onClick={() => setOpenMenu(openMenu === 'contact' ? null : 'contact')}><h1>CONTACT</h1></button>
        <SlideOutMenu isOpen={openMenu === 'contact'} direction="right" onClose={closeMenu}>
          <div className='flex justify-between w-full'>
            <button onClick={closeMenu}><h1>CONTACT</h1></button>
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
