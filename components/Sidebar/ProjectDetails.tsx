'use client';

import React from 'react'
import { Project } from '@/types'
import { urlForImage } from '@/sanity/lib/utils'
import styles from "./ProjectDetails.module.css";

const ProjectDetails = ({ displayedProject, renderAsset }: { displayedProject: Project | null, renderAsset: any }) => {
    const galleryThumbnails = (displayedProject?.gallery ?? [])
        .map((image) => ({
            key: image.asset?._ref,
            url: urlForImage(image)?.width(80).height(80).fit('crop').url(),
        }))
        .filter((thumbnail): thumbnail is { key: string; url: string } => Boolean(thumbnail.key && thumbnail.url))

    return (
        <div className={styles.container}>
            <div className={styles.body}>
            <div className={`${styles.title} ${!displayedProject?.client ? styles.titleEmpty : ''}`}>
                {displayedProject?.client || 'Client'}
            </div>
            <div className={`${styles.title} ${!displayedProject?.title ? styles.titleEmpty : ''}`}>
                {displayedProject?.title || 'Title'}
            </div>

                    {/* {displayedProject?.description && (
                        <div className={styles.description}>
                            <details>
                                <summary>Description & Credits</summary>
                                <div className={styles.details}>

                                    {
                                        displayedProject.description.length &&
                                        <PortableText value={displayedProject.description} />

                                    }
                                </div>
                            </details>
                        </div>
                    )} */}
                    {/* {displayedProject.credits && (
                        <div className={styles.credits}>
                            <details>
                                <summary>Credits</summary>
                                <ul>
                                    {displayedProject.credits.map((credit, idx) => (
                                        <li key={idx}>
                                            <span>{credit.role}:</span>{' '}
                                            {credit.link ? (
                                                <a href={credit.link} target="_blank">
                                                    {credit.name}
                                                </a>
                                            ) : (
                                                <span>{credit.name}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        </div>
                    )} */}
                {/* </div> */}

            </div>
            {galleryThumbnails.length > 0 ? (
                <div className={styles.assetsWrapper}>
                    {galleryThumbnails.map((thumbnail, idx) => (
                        <img
                            key={`${thumbnail.key}-${idx}`}
                            src={thumbnail.url}
                            alt={`Gallery thumbnail ${idx + 1} for ${displayedProject?.title ?? 'project'}`}
                            className={styles.asset}
                        />
                    ))}
                </div>
            ): 
            <div className={styles.assetsWrapper}>
                <div className={styles.asset}></div>
                <div className={styles.asset}></div>
                <div className={styles.asset}></div>
                <div className={styles.asset}></div>
            </div>}
        </div>
    )
}

export default React.memo(ProjectDetails)
