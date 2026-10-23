'use client'

import ArrowIcon from '@/features/site-shell/components/ArrowIcon/ArrowIcon'
import styles from './MobileProjectInfo.module.css'
import ProjectInfoPanel from '../WorkSidebar/ProjectInfoPanel'
 
type MobileProjectInfoProps = {
    project: any
    activeAssetIndex: number
    activeAssetKey?: string
    onAssetSelect: (index: number, imageKey?: string) => void
}

export function MobileProjectInfo({
    project,
    activeAssetIndex,
    activeAssetKey,
    onAssetSelect,
}: MobileProjectInfoProps) {
    return (
        <details className={styles.details}>
            <summary className={styles.summary}>
                <span>[PROJECT INFO]</span>
                <span className={styles.arrow} aria-hidden="true">
                    <ArrowIcon direction="down" />
                </span>
            </summary>
            <ProjectInfoPanel
                displayedProject={project}
                expandDetails
                activeAssetIndex={activeAssetIndex}
                activeAssetKey={activeAssetKey}
                onAssetSelect={onAssetSelect}
                variant="mobile"
            />
        </details>
    )
}
