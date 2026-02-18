import React, { useState } from 'react'
import { PortableText } from 'next-sanity'
import { Project } from '@/types'

const ProjectDetails = ({ displayedProject, onOpenModal, renderAsset }: { displayedProject: Project | null, onOpenModal: any, renderAsset: any }) => {
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)

    if (!displayedProject) return null

    const allProjectAssets = [
        ...(displayedProject.gallery ?? []).map((image) => ({ kind: 'image', value: image })),
        ...(displayedProject.videoUrls ?? []).map((videoUrl) => ({ kind: 'videoUrl', value: videoUrl })),
        ...(displayedProject.videos ?? []).map((video) => ({ kind: 'video', value: video })),
    ]

    const projectAssetCount = allProjectAssets.length

    const handleButtonClick = () => {
        onOpenModal(allProjectAssets)
    }

    return (
        <div className="work__project-details">
            <div className="work__project-details-body">
                <div className="work__project-details-title">{displayedProject.title}</div>
                {displayedProject.credits && (
                    <div className="work__project-details-credits">
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
                )}
                {displayedProject.description && (
                    <div className="work__project-details-description">
                        <details>
                            <summary>Description</summary>
                            <PortableText value={displayedProject.description} />
                        </details>
                    </div>
                )}
            </div>
            <div className="work__project-asset-controls">
                <div>({projectAssetCount})</div>
                <button onClick={handleButtonClick}>[Expand]</button>
            </div>
            <div className="work__project-assets">{allProjectAssets.map(renderAsset)}</div>
        </div>
    )
}

export default React.memo(ProjectDetails)
