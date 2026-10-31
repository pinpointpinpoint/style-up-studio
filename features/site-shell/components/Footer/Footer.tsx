import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {

    return (
        <footer className={styles.footer}>
            <Link href="/style-them-ups">
                <img src="/final_logo.svg" alt="Style Up Studio logo" className={styles.logo} />         
            </Link>
        </footer>
    )
}
