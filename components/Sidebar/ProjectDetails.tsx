'use client';

import React, { useState, useRef, useEffect } from 'react'
import { PortableText } from 'next-sanity'
import { Project } from '@/types'
import styles from "./ProjectDetails.module.css";

const ProjectDetails = ({ displayedProject, renderAsset }: { displayedProject: Project | null, renderAsset: any }) => {
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)
    const detailsWrapperRef = useRef<HTMLDivElement>(null);
    const [assetsMarginTop, setAssetsMarginTop] = useState(0);

    // if (!displayedProject) return null

    const allProjectAssets = [
        ...(displayedProject?.gallery ?? []).map((image) => ({ kind: 'image', value: image })),
        ...(displayedProject?.videoUrls ?? []).map((videoUrl) => ({ kind: 'videoUrl', value: videoUrl })),
        ...(displayedProject?.videos ?? []).map((video) => ({ kind: 'video', value: video })),
    ]

    const projectAssetCount = allProjectAssets.length

    // useEffect(() => {
    //     const updateMargin = () => {
    //         if (detailsWrapperRef.current) {
    //             setAssetsMarginTop(detailsWrapperRef.current.offsetHeight);
    //         }
    //     };

    //     // initial calculation
    //     updateMargin();

    //     // recalc when window resizes
    //     window.addEventListener('resize', updateMargin);
    //     return () => window.removeEventListener('resize', updateMargin);
    // }, [displayedProject]);

    return (
        <div className={styles.container}>
            <div className={styles.body}>
                <div className={styles.title}>{displayedProject?.title ? displayedProject.title : 'Title'}</div>
                <div className={styles.title}>{displayedProject?.client ? displayedProject.client : 'Client'}</div>
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

            <div className={styles.assetsWrapper}
                
            //  style={{ marginTop: `${assetsMarginTop}px` }}
             >
                {/* <div className={styles.controls}>
                    <div>({projectAssetCount})</div>
                    <button onClick={handleButtonClick}>[Expand]</button>
                </div> */}
                {/* <div className={styles.assets}>{allProjectAssets.map(renderAsset)}</div> */}
                <div className={styles.asset}></div>
                <div className={styles.asset}></div>
                <div className={styles.asset}></div>
                <div className={styles.asset}></div>
            </div>
        </div>
    )
}

export default React.memo(ProjectDetails)
