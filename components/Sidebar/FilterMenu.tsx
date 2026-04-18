'use client';

import { Filter } from '@/types'
import { Dispatch, SetStateAction, useState } from 'react'
import styles from './FilterMenu.module.css';
import { normalizeSidebarFilters } from '@/lib/normalizeSidebarFilters';

type CollaboratorFilterType = 'brand' | 'publication' | 'personality'
const FEATURED_ACTIVE_IMAGE_SRC = 'og/og_img.png'

type FilterMenuProps = {
  sidebarFilters: any | null
  filter: Filter
  setFilter: Dispatch<SetStateAction<Filter>>
}

export default function FilterMenu({
  sidebarFilters,
  filter,
  setFilter,
}: FilterMenuProps) {
  const { projectTypes, collaborators } = normalizeSidebarFilters(sidebarFilters)

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [hoverColor, setHoverColor] = useState<string>('transparent')

  let lastColor = ''

  const colors = [
    '#ECC815',
    '#DD81C1',
    '#5386D9',
    '#C10031',
    '#909C46',
    '#8E5BBA',
    '#E17A31'
  ]

  const randomColor = () => {
    let color = colors[Math.floor(Math.random() * colors.length)]

    while (color === lastColor) {
      color = colors[Math.floor(Math.random() * colors.length)]
    }

    lastColor = color
    return color
  }

  const handleProjectTypeClick = (projectTypeId: string) => {
    if (projectTypeId === 'featured') {
      setFilter({ type: 'featured' })
      return
    }

    if (projectTypeId === 'all') {
      setFilter({ type: 'all' })
      return
    }

    setFilter((prev) => (
      prev.type === 'projectType' && prev.id === projectTypeId
        ? { type: 'featured' }
        : { type: 'projectType', id: projectTypeId }
    ))
  }

  const handleCollaboratorClick = (filterType: CollaboratorFilterType, collaboratorId: string) => {
    setFilter((prev) => (
      prev.type === filterType && prev.id === collaboratorId
        ? { type: 'featured' }
        : { type: filterType, id: collaboratorId }
    ))
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>INDEX</div>
      {projectTypes.map((type) => (
        type.referenceCount > 0 && type.slug && (
          <div
            key={type._id}
            className={`${styles.categoryContainer} ${styles[type._id]}`}
          >
            <div className={styles.category}
              onMouseEnter={() => {
                setHoveredId(type._id)
                setHoverColor(randomColor())
              }}
              onMouseLeave={() => setHoveredId(null)}
              style={{ backgroundColor: hoveredId === type._id ? hoverColor : 'transparent' }}
            >
              <button
                onClick={() => handleProjectTypeClick(type._id)}
              >
                <span className={styles.categoryName}>
                  {filter.type === 'featured' && type._id === 'featured' && FEATURED_ACTIVE_IMAGE_SRC ? (
                    <img
                      src={FEATURED_ACTIVE_IMAGE_SRC}
                      alt=""
                      className={styles.activeImage}
                      aria-hidden="true"
                    />
                  ) : (
                    (
                      (filter.type === 'all' && type._id === 'all') ||
                      (filter.type === 'projectType' && filter.id === type._id)
                    ) && <span className={styles.dot}></span>
                  )}
                  {type.title}
                </span>
                <span>({type.referenceCount})</span>
              </button>
            </div>
          </div>
        )
      ))}
      <div className={styles.collaboratorsSection}>
        {/* <div className={styles.title}>COLLABORATORS</div> */}

        {collaborators
          .map((c) => (
            <details key={c.label} className={styles.details}>
              <summary onMouseEnter={() => {
                setHoveredId(c._id)
                setHoverColor(randomColor())
              }}
                onMouseLeave={() => setHoveredId(null)}
                style={{ backgroundColor: hoveredId === c._id ? hoverColor : 'transparent' }} className={styles.categoryName}>{c.label}</summary>
              <div className={styles.infoContent}>
                {c.items.filter((i) => i.slug).map((i) => (
                  <button
                    onMouseEnter={() => {
                      setHoveredId(i._id)
                      setHoverColor(randomColor())
                    }}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ backgroundColor: hoveredId === i._id ? hoverColor : 'transparent' }}
                    key={i._id}
                    type="button"
                    onClick={() => handleCollaboratorClick(c.filterType as CollaboratorFilterType, i._id)}
                  >
                    <span className={styles.categoryName}>
                      {'id' in filter && filter.type === c.filterType && filter.id === i._id && (
                        <span className={styles.dot}></span>
                      )}
                      {i.title}
                    </span>
                    <span>({i.referenceCount})</span>
                  </button>
                ))}
              </div>
            </details>
          ))}
      </div>
    </div>

  )
}
