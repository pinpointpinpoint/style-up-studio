'use client'

import { useState } from 'react'
import { SlideOutMenu } from './SlideOutMenu';
import styles from './Navbar.module.css'

export function Navbar() {
  const [openMenu, setOpenMenu] = useState<'about' | 'contact' | null>(null);

  const closeMenu = () => {
    setOpenMenu(null)
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.navbarItem}>
        <button onClick={() => setOpenMenu(openMenu === 'about' ? null : 'about')}><h1>ABOUT</h1></button>
        <SlideOutMenu isOpen={openMenu === 'about'} direction="left" onClose={closeMenu}>
          <div className={styles.menuContentRow}>
              <p className={styles.aboutText}>
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolore, at. Voluptas reiciendis fugiat voluptatum iusto omnis.</p>
              <button onClick={closeMenu}><h1>ABOUT</h1></button>
          </div>
        </SlideOutMenu>
      </div>
      <img className={styles.navbarLogo} alt="Style Up Studio" width="140px" src="minimal_logo.svg"/>
      <div className={styles.navbarItem}>
        <button onClick={() => setOpenMenu(openMenu === 'contact' ? null : 'contact')}><h1>CONTACT</h1></button>
        <SlideOutMenu isOpen={openMenu === 'contact'} direction="right" onClose={closeMenu}>
          <div className={styles.menuContentRow}>
            <button onClick={closeMenu}><h1>CONTACT</h1></button>
            <div className={styles.contactInfoRow}>
              <div className={styles.contactColumn}>
                <div>Email:</div>
                <div>Instagram:</div>
              </div>
              <div className={styles.contactColumn}>
                <a href="mailto:angie.jayasinghe@gmail.com" target="_blank">angie.jayasinghe@gmail.com</a>
                <a href="https://instagram.com/bby_aj" target="_blank">@bby_aj</a>
              </div>
            </div>
          </div>
        </SlideOutMenu>      
      </div>
    </header>
  )
}
