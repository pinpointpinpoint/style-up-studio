'use client'

import { useCallback, useId, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlForImage } from '@/sanity/lib/utils'
import type { About, Contact } from '@/sanity.types'
import getSafeMailto from '@/shared/utils/getSafeMailto'
import getSafeInstagramProfile from '@/shared/utils/getSafeInstagramProfile'
import ArrowIcon, { ArrowDirection } from '../ArrowIcon/ArrowIcon'
import { NavbarDrawer } from './NavbarDrawer'
import styles from './Navbar.module.css'

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
  onClose: () => void
}

interface ArrowButtonProps {
  ariaLabel: string
  direction: ArrowDirection
  onClick: () => void
}

function ArrowButton({ ariaLabel, direction, onClick }: ArrowButtonProps) {
  return (
    <button type="button" aria-label={ariaLabel} onClick={onClick}>
      <ArrowIcon direction={direction} />
    </button>
  )
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
          {trimmedBio && <p className={styles.bio}>{trimmedBio}</p>}
        </div>
      )}
      <ArrowButton direction="left" ariaLabel="Close about menu" onClick={onClose} />
    </>
  )
}

function ContactDrawerContent({
  email,
  emailHref,
  instagram,
  onClose,
}: ContactDrawerContentProps) {
  const emailLabel = email?.trim()
  const safeEmailHref = emailHref && emailLabel ? emailHref : null
  const hasLinks = Boolean(safeEmailHref || instagram)

  return (
    <>
      <ArrowButton direction="right" ariaLabel="Close contact menu" onClick={onClose} />
      {hasLinks && (
        <div className={styles.contactLinks}>
          <div className={styles.contactLinkList}>
            {safeEmailHref && <a href={safeEmailHref}>{emailLabel}</a>}
            {instagram && (
              <a href={instagram.href} target="_blank" rel="noopener noreferrer">
                {instagram.label}
              </a>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default function Navbar({ about, contact }: NavbarProps) {
  const aboutMenuId = useId()
  const contactMenuId = useId()
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null)
  const emailHref = getSafeMailto(contact?.email)
  const instagram = getSafeInstagramProfile(contact?.instagram)
  const aboutImageBuilder = about?.image ? urlForImage(about.image) : undefined
  const aboutImageUrl = aboutImageBuilder?.height(50).url()
  const aboutPreviewUrl = aboutImageBuilder?.height(800).url()

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
            <ArrowIcon direction="right" />
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
            <ArrowIcon direction="left" />
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
            />
          </NavbarDrawer>
        </div>
      </nav>
    </header>
  )
}
