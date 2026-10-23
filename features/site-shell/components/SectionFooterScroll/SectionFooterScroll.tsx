import {forwardRef, type ReactNode} from 'react'
import Footer from '@/features/site-shell/components/Footer/Footer'
import styles from './SectionFooterScroll.module.css'

type SectionFooterScrollProps = {
    children: ReactNode
    className?: string
    showFooter?: boolean
}

const SectionFooterScroll = forwardRef<HTMLDivElement, SectionFooterScrollProps>(
    function SectionFooterScroll({children, className, showFooter = true}, ref) {
        return (
            <div ref={ref} data-section-scroll className={`${styles.scroll} ${className ?? ''}`}>
                {children}
                {showFooter && <Footer />}
            </div>
        )
    },
)

export default SectionFooterScroll
