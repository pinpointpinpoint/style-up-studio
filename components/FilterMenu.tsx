'use client'

import {Category} from '@/types'
import {Dispatch, SetStateAction} from 'react'

type Filter = {
  category: string
  subcategories: string[]
}

type FilterMenuProps = {
  categories: Category[]
  filter: Filter
  hoveredCategoryId?: string
  setHoveredCategory: (categoryId: string) => void
  setFilter: Dispatch<SetStateAction<Filter>>
}

export default function FilterMenu({
  categories,
  filter,
  hoveredCategoryId,
  setHoveredCategory,
  setFilter,
}: FilterMenuProps) {
  //   useEffect(() => {
  //     console.log('mounted')

  //     return () => {
  //       console.log('unmounted')
  //     }
  //   }, [])

  const handleCategoryHover = (categoryId: string) => {
    setHoveredCategory(categoryId)
  }

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
    <div className="work__filter">
      {categories.map((cat) => (
        // if the cat is in the current filtered projects, get the count of it

        // Categories
        <div
          key={cat._id}
          className={`work__filter-category-group work__filter-category-group--${cat._id}`}
          onMouseEnter={() => handleCategoryHover(cat._id)}
          onMouseLeave={handleCategoryLeave}
        >
          {/* Category button */}
          <div className="work__filter-category">
            <button
              className={`work__filter-category-btn ${filter.category === cat._id ? 'work__filter-category-btn--active' : ''}`}
              onClick={() => handleCategoryClick(cat._id)}
              onFocus={() => handleCategoryHover(cat._id)}
            >
                    <span className="title">
                {' '}
                {filter.category === cat._id && <span className="dots">⬤</span>}
                {cat.title}
              </span>
              <span>({cat.referenceCount})</span>
            </button>
          </div>

          {/* Subcategories */}

          {cat.subcategories && cat.subcategories?.length > 0 && (
            <div
              className={`work__filter-subcategories work__filter-subcategories${
                hoveredCategoryId === cat._id ? '--expanded' : ''
              }`}
            >
              {cat.subcategories.map((sub) => (
                <div key={sub._id} className="work__filter-subcategory">
                  <button
                    className={`work__filter-subcategory-btn work__filter-subcategory-btn${
                      filter.subcategories.includes(sub._id) ? '--active' : ''
                    }`}
                    onClick={() => handleSubcategoryClick(sub._id, cat._id)}
                  >
                    <span className="title">
                      {' '}
                      {filter.subcategories.includes(sub._id) && (
                        <span className="dots">
                          <span>⬤</span>
                          <span>⬤</span>
                        </span>
                      )}
                      {sub.title}
                    </span>
                    <span>({sub.referenceCount})</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
