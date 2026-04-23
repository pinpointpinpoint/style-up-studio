import Link from 'next/link'
import styles from './not-found.module.css'

export default function NotFound() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span>404</span>
        <Link href="/" aria-label="Go to home">
          <img className={styles.logo} src="/minimal_logo.svg" alt="Style Up Studio" />
        </Link>
      </header>
      <div className={styles.content}>
        <section className={styles.panel} aria-labelledby="not-found-title">
          <h1 id="not-found-title" className={styles.title}>
            PAGE NOT FOUND
          </h1>
          <p className={styles.copy}>
            This page is not in the archive. It may have moved, changed names, or never made it to the final edit.
          </p>
          <div className={styles.actions}>
            <Link className={styles.link} href="/">
              [BACK TO WORK]
            </Link>
            <Link className={styles.link} href="/style-ups">
              [STYLE UPS]
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
