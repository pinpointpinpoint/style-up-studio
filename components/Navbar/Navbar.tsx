'use client'

import { useState } from 'react'
import { SlideOutMenu } from './SlideOutMenu';
import styles from './Navbar.module.css'
import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/utils';

export default function Navbar({about, contact}) {
  const [openMenu, setOpenMenu] = useState<'about' | 'contact' | null>(null);
  const aboutImageUrl = urlForImage(about?.image)?.height(60).url()
  const aboutPreviewUrl = urlForImage(about?.image)?.height(800).url()

  const closeMenu = () => {
    setOpenMenu(null)
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.navbarItem}>
        <button onClick={() => setOpenMenu(openMenu === 'about' ? null : 'about')}>ABOUT</button>
        <SlideOutMenu isOpen={openMenu === 'about'} direction="left" onClose={closeMenu}>
          <div className={styles.menuContentRow}>
              <span className={styles.aboutPreview}>
                {aboutImageUrl && (
                  <span className={styles.aboutImageHover}>
                    <img className={styles.aboutImageThumb} src={aboutImageUrl} alt="" />
                    <img className={styles.aboutImageLarge} src={aboutPreviewUrl} alt="" />
                  </span>
                )}
                <p className={styles.aboutText}>{about.bio}</p>
              </span>
              <button onClick={closeMenu}>ABOUT</button>
          </div>
        </SlideOutMenu>
      </div>
      <Link href="/">
        <img className={styles.navbarLogo} alt="Style Up Studio" width="140px" src="/minimal_logo.svg"/>
      </Link>
      <div className={styles.navbarItem}>
        <button onClick={() => setOpenMenu(openMenu === 'contact' ? null : 'contact')}>CONTACT</button>
        <SlideOutMenu isOpen={openMenu === 'contact'} direction="right" onClose={closeMenu}>
          <div className={styles.menuContentRow}>
            <button onClick={closeMenu}>CLOSE</button>
            <div className={styles.contactInfoRow}>
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
