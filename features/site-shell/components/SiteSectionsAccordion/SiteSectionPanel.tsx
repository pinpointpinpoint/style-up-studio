import Link from 'next/link'
import {motion, useReducedMotion} from 'motion/react'
import type {MouseEvent, ReactNode} from 'react'
import ArrowIcon, {type ArrowDirection} from '../ArrowIcon/ArrowIcon'
import styles from './SiteSectionsAccordion.module.css'

type SiteSectionPanelProps = {
    title: string
    actionContent?: ReactNode
    contextContent?: ReactNode
    route: string
    active: boolean
    current: boolean
    interactive: boolean
    fullHeaderAction?: boolean
    height: string | number
    arrowDirection?: ArrowDirection
    children?: ReactNode
    onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void
    onIntent?: () => void
}

export default function SiteSectionPanel({
    title,
    actionContent,
    contextContent,
    route,
    active,
    current,
    interactive,
    fullHeaderAction = false,
    height,
    arrowDirection,
    children,
    onNavigate,
    onIntent,
}: SiteSectionPanelProps) {
    const shouldReduceMotion = useReducedMotion()

    return (
        <motion.div
            className={`${styles.section} ${active ? styles.open : ''}`}
            initial={false}
            animate={{height}}
            transition={{
                duration: shouldReduceMotion ? 0 : 0.28,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            <div className={styles.header}>
                {interactive ? (
                    <Link
                        href={route}
                        className={`${styles.headerAction} ${fullHeaderAction ? styles.headerActionFull : ''}`}
                        onClick={onNavigate}
                        onFocus={onIntent}
                        onMouseEnter={onIntent}
                        onTouchStart={onIntent}
                        aria-current={current ? 'page' : undefined}
                    >
                        <span className={styles.headerLabel}>
                            <span className={styles.headerContent}>{actionContent ?? title}</span>
                            {fullHeaderAction && contextContent}
                        </span>
                        {arrowDirection && (
                            <span className={styles.headerArrow} aria-hidden="true">
                                <ArrowIcon direction={arrowDirection} />
                            </span>
                        )}
                    </Link>
                ) : (
                    <span className={styles.headerContent}>{actionContent ?? title}</span>
                )}
                {!fullHeaderAction && contextContent}
            </div>
            <div
                id={`${title.toLowerCase().replace(/\s+/g, '-')}-panel`}
                className={styles.panel}
                aria-hidden={!active}
                inert={!active ? true : undefined}
            >
                {children}
            </div>
        </motion.div>
    )
}
