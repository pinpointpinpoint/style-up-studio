'use client'

import styles from './MobileProjectInfo.module.css'
import ProjectInfoPanel from '../WorkSidebar/ProjectInfoPanel'
 
type MobileProjectInfoProps = {
    project: any
    activeAssetIndex: number
    onAssetSelect: (index: number) => void
}

export function MobileProjectInfo({
    project,
    activeAssetIndex,
    onAssetSelect,
}: MobileProjectInfoProps) {
    return (
        <details className={styles.details}>
            <summary className={styles.summary}>[INFO]</summary>
            <ProjectInfoPanel
                displayedProject={project}
                expandDetails
                activeAssetIndex={activeAssetIndex}
                onAssetSelect={onAssetSelect}
                variant="mobile"
            />
        </details>
    )
}