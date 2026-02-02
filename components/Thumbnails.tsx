import React from 'react';
import { urlFor } from '@/sanity/lib/utils';
import { Project } from '@/types';
import Image from "next/image";

// Props interface
interface ThumbnailProps {
    project: Project;
    activeProject: Project | null;
    rotations: Record<string, number>;
    handleClick: (project: Project) => void; 
    handleLeave: () => void;
    handleHover: (project: Project) => void;

}

// Functional component
const Thumbnails: React.FC<ThumbnailProps> = ({ handleClick, handleHover, handleLeave, activeProject, project, rotations }) => {

  return (
        <button
            className={`work__project-card 
                    ${activeProject === project ? 'work__project-card--active': ''}
                `}
            onMouseEnter={() => handleHover(project)}
            onMouseLeave={handleLeave}
            onClick={() => handleClick(project)}
            style={
            {
                '--rotate': `${rotations[project._id] ?? 0}deg`,
            } as React.CSSProperties
            }
            >
                <Image 
                    className="work__project-card-img"
                    src={urlFor(project.coverImage)?.height(600).width(600).auto('format').url()} 
                    width={500}
                    height={500}
                    alt={typeof project.coverImage.alt === 'string' 
                        ? project.coverImage.alt 
                        : `Cover image for ${project.title}`}
                                    />
        </button>
  );
};

export default Thumbnails;
