'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { urlForImage } from '@/sanity/lib/utils'
import type { About, Contact } from '@/sanity.types'
import getSafeMailto from '@/shared/utils/getSafeMailto'
import getSafeInstagramProfile from '@/shared/utils/getSafeInstagramProfile'
import { NavbarDrawer } from './NavbarDrawer'
import styles from './Navbar.module.css'
import ArrowIcon from '../ArrowIcon/ArrowIcon'
import Image from 'next/image'

type MenuKey = 'about' | 'contact'
type EmailHref = ReturnType<typeof getSafeMailto>
type InstagramProfile = ReturnType<typeof getSafeInstagramProfile>

type NavbarAbout = Pick<About, 'bio' | 'image'> | null
type NavbarContact = Pick<Contact, 'email' | 'instagram'> | null

interface NavbarProps {
  about?: NavbarAbout
  contact?: NavbarContact
}

interface AboutDrawerContentProps {
  bio?: string
  imageUrl?: string
  previewUrl?: string
  onClose: () => void
}

interface ContactDrawerContentProps {
  email?: string
  emailHref: EmailHref
  instagram: InstagramProfile
  onClose?: () => void
  version: string
}

function AboutDrawerContent({
  bio,
  imageUrl,
  previewUrl,
  onClose,
}: AboutDrawerContentProps) {
  const trimmedBio = bio?.trim()
  const hasImage = Boolean(imageUrl && previewUrl)
  const hasContent = hasImage || Boolean(trimmedBio)

  return (
    <>
      {hasContent && (
        <div className={styles.aboutSummary}>
          <button onClick={onClose}>[CLOSE]</button>
          <div className={styles.aboutContent}>
            {imageUrl && previewUrl && (
              <div className={styles.aboutImage}>
                <Image
                  className={styles.aboutImageThumb}
                  src={imageUrl}
                  alt=""
                  width={400}
                  height={600}
                  sizes="60px"
                />
                <Image
                  className={styles.aboutImageFull}
                  src={previewUrl}
                  alt=""
                  width={400}
                  height={600}
                  sizes="400px"
                  aria-hidden="true"
                />
              </div>
            )}
            {trimmedBio && (
              <>
                <p className={styles.bio}>
                  <span className={styles.bioCopy}>{trimmedBio}</span>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function ContactDrawerContent({
  email,
  emailHref,
  instagram,
  onClose,
  version
}: ContactDrawerContentProps) {
  const emailLabel = email?.trim()
  const safeEmailHref = emailHref && emailLabel ? emailHref : null
  const hasLinks = Boolean(safeEmailHref || instagram)

  return (
    <>
      {hasLinks && version === "mobile" ?
        <div>
          {instagram && (
            <div className={styles.ig}>
              <a href={instagram.href} target="_blank" rel="noopener noreferrer">
                {instagram.label}
              </a>
              <ArrowIcon direction='upRight' />
            </div>
          )}
          {safeEmailHref &&
              <div className={styles.email}>
                <a href={safeEmailHref}>{emailLabel}</a>
                <ArrowIcon direction='upRight' />
              </div>
            }
        </div>
        :
        (<div className={styles.contactLinks}>
          <div className={styles.contactLinkList}>
            {safeEmailHref &&
              <div>
                <a href={safeEmailHref}>{emailLabel}</a>
                <ArrowIcon direction='upRight' />
              </div>
            }
            {instagram && (
              <div>
                <a href={instagram.href} target="_blank" rel="noopener noreferrer">
                  {instagram.label}
                </a>
                <ArrowIcon direction='upRight' />
              </div>
            )}
          </div>
          <button onClick={onClose}>[CLOSE]</button>
        </div>
        )}
    </>
  )
}

export default function Navbar({ about, contact }: NavbarProps) {
  const aboutMenuId = useId()
  const contactMenuId = useId()
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null)
  const mobileContentRef = useRef<HTMLDivElement>(null)
  const [mobileContentHeight, setMobileContentHeight] = useState(0)
  const emailHref = getSafeMailto(contact?.email)
  const instagram = getSafeInstagramProfile(contact?.instagram)
  const aboutImageBuilder = about?.image ? urlForImage(about.image) : undefined
  const aboutImageUrl = aboutImageBuilder?.height(50).url()
  const aboutPreviewUrl = aboutImageBuilder?.height(800).url()

  useEffect(() => {
    const content = mobileContentRef.current
    if (!content) return

    const observer = new ResizeObserver(() => {
      setMobileContentHeight(content.getBoundingClientRect().height)
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  const closeMenu = useCallback(() => {
    setActiveMenu(null)
  }, [])

  const toggleMenu = useCallback((menu: MenuKey) => {
    setActiveMenu((currentMenu) => currentMenu === menu ? null : menu)
  }, [])

  return (
    <header className={styles.header}>
      <nav aria-label="Site navigation" className={styles.nav}>
        <div className={styles.navItem}>
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={activeMenu === 'about'}
            aria-controls={aboutMenuId}
            onClick={() => toggleMenu('about')}
          >
            <span>ABOUT</span>
          </button>
          <NavbarDrawer
            id={aboutMenuId}
            label="About"
            isOpen={activeMenu === 'about'}
            direction="left"
            onClose={closeMenu}
          >
            <AboutDrawerContent
              bio={about?.bio}
              imageUrl={aboutImageUrl}
              previewUrl={aboutPreviewUrl}
              onClose={closeMenu}
            />
          </NavbarDrawer>
        </div>
        <nav className={styles.mobileNav}>
          <details>
            <summary>INFO</summary>
            <div className={styles.infoContent}>
              <div ref={mobileContentRef} className={styles.content}>
                <p className={styles.bio}>{about?.bio}</p>
                <ContactDrawerContent
                  email={contact?.email}
                  emailHref={emailHref}
                  instagram={instagram}
                  version="mobile"
                />
              </div>
              <div className={styles.imgWrapper}>
                <img src={aboutPreviewUrl} alt="" style={{height: mobileContentHeight}} />
              </div>
            </div>
          </details>
        </nav>
        <Link href="/" aria-label="Style Up Studio home">
          <img className={styles.logo} src="/minimal_logo.svg" alt="Style Up Studio" />
        </Link>
        <div className={styles.navItem}>
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={activeMenu === 'contact'}
            aria-controls={contactMenuId}
            onClick={() => toggleMenu('contact')}
          >
            <span>CONTACT</span>
          </button>
          <NavbarDrawer
            id={contactMenuId}
            label="Contact"
            isOpen={activeMenu === 'contact'}
            direction="right"
            onClose={closeMenu}
          >
            <ContactDrawerContent
              email={contact?.email}
              emailHref={emailHref}
              instagram={instagram}
              onClose={closeMenu}
              version="desktop"
            />
          </NavbarDrawer>
        </div>
      </nav>
    </header>
  )
}
