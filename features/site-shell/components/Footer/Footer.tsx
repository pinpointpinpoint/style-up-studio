import styles from './Footer.module.css'

export default function Footer() {

    return (
        <footer className={styles.footer}>
            <img src="/final_logo.svg" alt="Style Up Studio logo" className={styles.logo} />
            <div className={styles.details}>
                <span>©2026 Angie Jayasinghe</span>
                {/* <span>·</span> */}
                <a href="https://pinpointpinpoint.com" target='_blank'>Site Credits</a>
            </div>            
        </footer>
    )
}
