'use client'

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { urlForImage } from '@/sanity/lib/utils'
import type { About, Contact } from '@/sanity.types'
import getSafeMailto from '@/shared/utils/getSafeMailto'
import getSafeInstagramProfile from '@/shared/utils/getSafeInstagramProfile'
import { NavbarDrawer } from './NavbarDrawer'
import styles from './Navbar.module.css'
import ArrowIcon from '../ArrowIcon/ArrowIcon'
import Image from 'next/image'
import {useNavbarScrollVisibility} from './useNavbarScrollVisibility'

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
            <a href={instagram.href} target="_blank" rel="noopener noreferrer">
              <div className={styles.ig}>
                  {instagram.label}
                <ArrowIcon direction='upRight' />
              </div>
            </a>
          )}
          {safeEmailHref &&
              <a href={safeEmailHref} aria-label={`Email ${emailLabel}`} title={emailLabel}>
                <div className={styles.email}>
                  <span className={styles.emailAddress}>{emailLabel}</span>
                  <span className={styles.emailShortLabel} aria-hidden="true">Contact</span>
                  <ArrowIcon direction='upRight' />
                </div>
              </a>
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
  const {isHidden, showNavbar} = useNavbarScrollVisibility()
  const aboutMenuId = useId()
  const contactMenuId = useId()
  const [activeMenu, setActiveMenu] = useState<MenuKey | null>(null)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const infoContentRef = useRef<HTMLDivElement>(null)
  const mobileContentRef = useRef<HTMLDivElement>(null)
  const mobileImageRef = useRef<HTMLImageElement>(null)
  const emailHref = getSafeMailto(contact?.email)
  const instagram = getSafeInstagramProfile(contact?.instagram)
  const aboutImageBuilder = about?.image ? urlForImage(about.image) : undefined
  const aboutImageUrl = aboutImageBuilder?.height(50).url()
  const aboutPreviewUrl = aboutImageBuilder?.height(800).url()

  useEffect(() => {
    if (!isMobileNavOpen) return

    const handleClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        !infoContentRef.current?.contains(event.target)
      ) {
        setIsMobileNavOpen(false)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [isMobileNavOpen])

  useLayoutEffect(() => {
    const panel = infoContentRef.current
    const content = mobileContentRef.current
    const image = mobileImageRef.current
    if (!panel || !content) return

    panel.dataset.ready = 'false'
    if (!isMobileNavOpen) return

    const updateLayout = () => {
      if (image && !image.complete) return

      // Image width depends on its height, which can change how the bio wraps.
      // Resolve those measurements together before revealing the panel.
      if (image) {
        for (let pass = 0; pass < 32; pass++) {
          const height = content.getBoundingClientRect().height
          if (Math.abs(image.getBoundingClientRect().height - height) < 0.5) break
          image.style.height = `${height}px`
        }
      }
      panel.dataset.ready = 'true'
    }

    updateLayout()
    const observer = new ResizeObserver(updateLayout)
    observer.observe(content)
    image?.addEventListener('load', updateLayout)
    image?.addEventListener('error', updateLayout)
    return () => {
      observer.disconnect()
      image?.removeEventListener('load', updateLayout)
      image?.removeEventListener('error', updateLayout)
    }
  }, [isMobileNavOpen, aboutPreviewUrl])

  const closeMenu = useCallback(() => {
    setActiveMenu(null)
  }, [])

  const toggleMenu = useCallback((menu: MenuKey) => {
    setActiveMenu((currentMenu) => currentMenu === menu ? null : menu)
  }, [])

  return (
    <header
      className={styles.header}
      data-hidden={isHidden && !activeMenu && !isMobileNavOpen}
      onFocusCapture={showNavbar}
    >
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
          <details
            open={isMobileNavOpen}
            onToggle={(event) => setIsMobileNavOpen(event.currentTarget.open)}
          >
            <summary
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setIsMobileNavOpen((isOpen) => !isOpen)
              }}
            >
              {isMobileNavOpen ? '[CLOSE]' : 'INFO'}
            </summary>
            <div ref={infoContentRef} className={styles.infoContent} data-ready="false">
              <div ref={mobileContentRef} className={styles.content}>
                <p className={styles.bio}>{about?.bio}</p>
                <ContactDrawerContent
                  email={contact?.email}
                  emailHref={emailHref}
                  instagram={instagram}
                  version="mobile"
                />
              </div>
              {aboutPreviewUrl && <div className={styles.imgWrapper}>
                <img ref={mobileImageRef} src={aboutPreviewUrl} alt="" />
              </div>}
            </div>
          </details>
        </nav>
        <Link href="/" aria-label="Style Up Studio home" className={styles.logoLink}>
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
