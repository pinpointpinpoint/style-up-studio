import { ProjectType } from '@/types'
import { Dispatch, SetStateAction, useState } from 'react'
import { Filter } from '@/types'
import styles from './FilterMenu.module.css';
import  { useMouseMoved } from '@/hooks/useMouseInitiatedHover';

type FilterMenuProps = {
  projectTypes: ProjectType[]
  filter: Filter
  hoveredCategoryId?: string
  setHoveredCategory: (categoryId: string) => void
  setFilter: Dispatch<SetStateAction<Filter>>
}

export default function FilterMenu({
  projectTypes,
  filter,
  hoveredCategoryId,
  setHoveredCategory,
  setFilter,
}: FilterMenuProps) {  

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

  const hasMouseMoved = useMouseMoved();

  const handleCategoryHover = (categoryId: string, hasSubcategories: boolean) => {
    if (!hasSubcategories || !hasMouseMoved) return;
    setHoveredCategory(categoryId);
  };

  const isSubmenuOpen = (categoryId: string, hasSubcategories: boolean) =>
    hasMouseMoved && hoveredCategoryId === categoryId && !!hasSubcategories;

  const handleCategoryLeave = () => {
    setHoveredCategory('')
  }

  const handleCategoryClick = (categoryId: string) => {
    setFilter((prev) =>
      prev.category === categoryId
        ? {
          category: 'featured',
          subcategories: [],
        }
        : {
          category: categoryId,
          subcategories: [],
        },
    )
  }

  const handleSubcategoryClick = (subId: string, parentId: string) => {
    setFilter((prev) => {
      const isSameParent = prev.category === parentId
      const isActive = prev.subcategories.includes(subId)

      if (!isSameParent) {
        return {
          category: parentId,
          subcategories: [subId],
        }
      }

      return {
        category: parentId,
        subcategories: isActive
          ? prev.subcategories.filter((id) => id !== subId)
          : [...prev.subcategories, subId],
      }
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>PROJECT TYPE</div>
      {projectTypes.map((cat) => (
        cat.referenceCount > 0 && (
          <div
            key={cat._id}
            className={`${styles.categoryContainer} ${styles[cat._id]}`}
            onMouseLeave={handleCategoryLeave}
          >
            <div className={styles.category}
              onMouseEnter={() => {
                setHoveredId(cat._id)
                setHoverColor(randomColor())
              }}
              onMouseLeave={() => setHoveredId(null)}
              style={{ backgroundColor: hoveredId === cat._id ? hoverColor : 'transparent' }}
            >
              <button
                onClick={() => handleCategoryClick(cat._id)}
              >
                <span className={styles.categoryName}>
                  {filter.category === cat._id && <span className={styles.dot}></span>}
                  {cat.title}
                </span>
                <span>({cat.referenceCount})</span>
              </button>
            </div>
          </div>
        ) 
      ))}
 

  <div className={styles.collaboratorsSection}>
    <div className={styles.title}>COLLABORATORS</div>
    <details className={styles.details}>
      <summary>Personalities</summary>
      <div className={styles.infoContent}>
        <div className={styles.category}
          onMouseEnter={() => {
          // setHoveredId(cat._id)
          setHoverColor(randomColor())
          }}
          onMouseLeave={() => setHoveredId(null)}
          // style={{ backgroundColor: hoveredId === cat._id ? hoverColor : 'transparent' }}
        >
          <button
            // onClick={() => handleCategoryClick(cat._id)}
            // onFocus={() => handleCategoryHover(cat._id, !!cat.subcategories?.length)}
          >
            <span className={styles.categoryName}>
              {/* {filter.category === cat._id && <span className={styles.dot}></span>} */}
              {/* {cat.title} */}
              Bambii
            </span>
            {/* <span>({cat.referenceCount})</span> */}
            <span>(2)</span>
          </button>
        </div>
      </div>
    </details>
      <details className={styles.details}>
      <summary>Brands</summary>
      <div className={styles.infoContent}>
      </div>
    </details>
      <details className={styles.details}>
      <summary>Publications</summary>
      <div className={styles.infoContent}>
      </div>
    </details>
  </div>
</div>

  )
}
