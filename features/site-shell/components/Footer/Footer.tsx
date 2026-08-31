import type {Contact} from '@/sanity.types'
import getSafeInstagramProfile from '@/shared/utils/getSafeInstagramProfile'
import getSafeMailto from '@/shared/utils/getSafeMailto'
import styles from './Footer.module.css'

/* eslint-disable @next/next/no-img-element -- The footer renders a static SVG logo from public/. */

type FooterContact = Pick<Contact, 'email' | 'instagram'> | null

type FooterProps = {
    contact?: FooterContact
}

export default function Footer({contact}: FooterProps) {
    const emailLabel = contact?.email?.trim()
    const emailHref = getSafeMailto(contact?.email)
    const instagram = getSafeInstagramProfile(contact?.instagram)
    const hasLinks = Boolean((emailLabel && emailHref) || instagram)

    return (
        <footer className={styles.footer}>
            <img src="/final_logo.svg" alt="Style Up Studio logo" className={styles.logo} />
            {hasLinks && (
                <nav className={styles.links} aria-label="Footer contact links">
                    {emailLabel && emailHref && <a href={emailHref}>{emailLabel}</a>}
                    {instagram && (
                        <a href={instagram.href} target="_blank" rel="noopener noreferrer">
                            {instagram.label}
                        </a>
                    )}
                </nav>
            )}
        </footer>
    )
}
