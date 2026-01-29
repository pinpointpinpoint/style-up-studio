'use client';

import { Category, Project } from "@/types";
import { FC, useEffect, useState, useMemo } from "react";
import { getYouTubeId, urlFor } from "@/sanity/lib/utils";
import { PortableText } from "next-sanity";
import Thumbnails from "./Thumbnails";

interface WorkProps {
  projects: Project[] | null;
  categories: Category[],
}

export const Work: FC<WorkProps> = ({ projects, categories }) => {
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
    const [rotations, setRotations] = useState<Record<string, number>>({});
    const [isLocked, setIsLocked] = useState(false);
    const [hoveredCategory, setHoveredCategory] = useState<string>();
    const [filter, setFilter] = useState<{
        category: string,
        subcategories: string[]
    }>({
        category: 'featured',
        subcategories: []
    });

    const staticCategories: Category[] = [
    { _id: 'featured', title: 'Featured', subcategories: [] },
    { _id: 'all', title: 'All', subcategories: [] },
    ];

    const allCategories = [...staticCategories, ...categories]

    const displayedProject = hoveredProject && hoveredProject !== activeProject
    ? hoveredProject
    : activeProject;

    const filteredProjects = useMemo(() => {
        if (!projects) return [];

        console.log(projects)

        // only fire if a category or subcategory was clicked?

        // Featured
        if (filter.category === 'featured') {
            return projects.filter(p => p.featured);
        }

        // All
        if (filter.category === 'all') {
            return projects;
        }

        return projects.filter(project => {
            const matchesCategory =
            project.categories?.some(cat => cat._id === filter.category);

            const matchesSubcategories =
            filter.subcategories?.length === 0 ||
            project.subcategory && filter.subcategories?.includes(project.subcategory._id);

            return matchesCategory && matchesSubcategories;
        });
    }, [projects, filter]);


    useEffect(() => {
    if (!isLocked || !activeProject) return;

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;

        const activeCard = document.querySelector(
        '.work__project-card--active'
        );

        if (activeCard && !activeCard.contains(target)) {
        setActiveProject(null);
        setIsLocked(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
    }, [isLocked, activeProject]);


    useEffect(() => {            
        const slider = document.querySelector(
            '.work__project-images'
        ) as HTMLElement;

        if (!slider) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        const onMouseDown = (e: MouseEvent) => {
            isDown = true;
            slider.classList.add('is-dragging');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        };

        const onMouseLeave = () => {
            isDown = false;
            slider.classList.remove('is-dragging');
        };

        const onMouseUp = () => {
            isDown = false;
            slider.classList.remove('is-dragging');
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.2; // scroll speed
            slider.scrollLeft = scrollLeft - walk;
        };

        slider.addEventListener('pointerdown', onMouseDown);
        slider.addEventListener('pointerleave', onMouseLeave);
        slider.addEventListener('pointerup', onMouseUp);
        slider.addEventListener('pointermove', onMouseMove);

        return () => {
            slider.removeEventListener('pointerdown', onMouseDown);
            slider.removeEventListener('pointerleave', onMouseLeave);
            slider.removeEventListener('pointerup', onMouseUp);
            slider.removeEventListener('pointermove', onMouseMove);
        };
    }, []);

    const handleCategoryHover = (categoryId: string) => {
        setHoveredCategory(categoryId);
    }

    const handleCategoryLeave = () => {
        setHoveredCategory('');
    };

    const handleCategoryClick = (categoryId: string) => {
        setFilter(prev =>
            prev.category === categoryId 
            ? 
            {
                category: 'featured',
                subcategories: []
            } :
            {
                category: categoryId,
                subcategories: []
            }
        );
    }

    const handleSubcategoryClick = (subId: string, parentId: string) => {
        setFilter(prev => {
            const isSameParent = prev.category === parentId;
            const isActive = prev.subcategories.includes(subId);

            if (!isSameParent) {
                return {
                    category: parentId,
                    subcategories: [subId],
                };
            }

            return {
                category: parentId,
                subcategories: isActive
                    ? prev.subcategories.filter(id => id !== subId)
                    : [...prev.subcategories, subId]
            };
        });
    };

    const handleHover = (project: Project) => {
        if (isLocked) return;

        setHoveredProject(project);
    };

    const handleLeave = () => {
        if (isLocked) return;
        setHoveredProject(null);
    };

    const handleClick = (project: Project) => {
        const possibleRotations = [-3, -2, 2, 3]; // never 0 or ±1/2
        const randomIndex = Math.floor(Math.random() * possibleRotations.length);
        const rotation = possibleRotations[randomIndex];

        setHoveredProject(project);

        setRotations((prev) => {
            if (prev[project._id]) return prev;
            return {
            ...prev,
            [project._id]: rotation,
            };
        });

        setActiveProject(project);
        setHoveredProject(null);
        setIsLocked(true);
    };

    
  return (
    <div className="work">
    <div className="work__projects" 
>
        {filteredProjects.map((project) => (
            <Thumbnails
                key={project._id}
                project={project}
                activeProject={activeProject}
                rotations={rotations}
                handleClick={handleClick}
                handleHover={handleHover}
                handleLeave={handleLeave}
            />
        ))}
    </div>

    <aside className="work__sidebar">
        <div className="work__filter">
            {allCategories.map((cat) => (

                // Categories
                <div 
                    key={cat._id} 
                    className={`work__filter-category-group work__filter-category-group--${cat._id}`}
                    onMouseEnter={() => handleCategoryHover(cat._id)}
                    onMouseLeave={handleCategoryLeave}
                >

                    {/* Category button */}
                    <button
                        className={`work__filter-category ${ filter.category === cat._id ? 'work__filter-category--active' : ''}`}
                        onClick={() => handleCategoryClick(cat._id)}
                        onFocus={() => handleCategoryHover(cat._id)}
                    >{cat.title}</button>

                    {/* Subcategories */}

                    {
                        cat.subcategories && cat.subcategories?.length > 0 &&
                        <div className={`work__filter-subcategories work__filter-subcategories${
                                hoveredCategory === cat._id ? '--expanded' : ''
                            }`}>
                            {cat.subcategories.map((sub) => (
                                <button 
                                    key={sub._id}
                                    className={`work__filter-subcategory work__filter-subcategory${
                                        filter.subcategories.includes(sub._id) ? '--active' : ''
                                    }`}
                                    onClick={() => handleSubcategoryClick(sub._id, cat._id)}
                                >
                                    {sub.title}
                                </button>
                            ))}
                        </div>
                    }
                </div>
            ))}
        </div>

        { displayedProject &&
        <div className="work__project-details">
            <div className="work__project-details-body">

                <div className="work__project-details-title">{displayedProject?.title}</div>
                <div className="work__project-details__categories">
                    
                    {displayedProject?.categories?.map((cat) => (<span key={cat._id} className="work__project-details__category">{cat.title}</span>))}
                    {displayedProject?.subcategory && <span className="work__project-details__subcategory">{displayedProject.subcategory.title}</span>}

                    
                </div>
                {
                    displayedProject?.credits &&
                        <div className="work__project-details-credits">
                            <details>
                                <summary>Credits</summary>
                                <div>
                                    <ul>
                                        {displayedProject?.credits.map((credit,idx) => (
                                            <li key={idx}><span>{credit.role} </span><span>{credit.name}</span></li>
                                        ))}
                                    </ul>
                                </div>
                            </details>
                        </div>
                }
                {
                    displayedProject?.description && (
                        <div className="work__project-details-description">
                            <details>
                                <summary>Description</summary>
                                <div>
                                    <ul>
                                            <PortableText value={displayedProject.description} />
                                    </ul>
                                </div>
                            </details>
                        </div>
                )}
            </div>


            {/* If there is only one thing, make it take the whole widht? but if there is mroe have the horizontal scrolling */}
            <div
                className="work__project-images"
                onWheel={(e) => {
                    const el = e.currentTarget;

                    const canScrollHorizontally =
                        el.scrollWidth > el.clientWidth;

                    if (!canScrollHorizontally) return;

                    // Only prevent default if we actually scroll horizontally
                    e.preventDefault();
                    el.scrollLeft += e.deltaY;
                    }}
            >

            {/* {activeProject?.gallery && } */}

            {displayedProject?.videoUrls && displayedProject?.videoUrls.map((videoUrl, idx) => (
                <div className="work__project-video-embed" key={idx}>
                    <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl.url)}`}
                        allowFullScreen
                    />
                </div>
            ))}

            {displayedProject?.videos && displayedProject?.videos.map((video, idx) => (
                <video controls key={video._key} poster={urlFor(displayedProject.coverImage)?.width(800).height(450).url()}>
                    <source src={video.fileUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )
            )}
            

            </div>
            {/* <div>(4)</div> */}
        
            {/* calculate total count of all assets and display here */}

        </div>

        }
    </aside>
    </div>
  );
};