import {forwardRef, type ReactNode} from 'react'
import Footer from '@/features/site-shell/components/Footer/Footer'
import styles from './SectionFooterScroll.module.css'

type SectionFooterScrollProps = {
    children: ReactNode
    className?: string
}

const SectionFooterScroll = forwardRef<HTMLDivElement, SectionFooterScrollProps>(
    function SectionFooterScroll({children, className}, ref) {
        return (
            <div ref={ref} className={`${styles.scroll} ${className ?? ''}`}>
                {children}
                <Footer />
            </div>
        )
    },
)

export default SectionFooterScroll
