'use client'

import { Category } from '@/types'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Filter } from '@/types'
import styles from './FilterMenu.module.css';
import  { useMouseMoved } from '@/hooks/useMouseInitiatedHover';

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

  const hasMouseMoved = useMouseMoved();

    // useEffect(() => {
    //   console.log('mounted')

    //   console.log(hoveredCategoryId)

    //   return () => {
    //     console.log('unmounted')
    //   }
    // }, [hoveredCategoryId])

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
  {categories.map((cat) => (
    <div
      key={cat._id}
      className={`${styles.categoryContainer} ${styles[cat._id]}`}
      onMouseEnter={() => handleCategoryHover(cat._id, !!cat.subcategories?.length)}
      onMouseLeave={handleCategoryLeave}
    >
      {/* Category button */}
      <div className={styles.category}>
        <button
          onClick={() => handleCategoryClick(cat._id)}
          onFocus={() => handleCategoryHover(cat._id, !!cat.subcategories?.length)}
        >
          <span className={styles.title}>
            {filter.category === cat._id && <span className={styles.dot}></span>}
            {cat.title}
          </span>
          <span>({cat.referenceCount})</span>
        </button>
      </div>

      {/* Subcategories */}
      {cat.subcategories && cat.subcategories.length > 0 && (
        <div
          className={`${styles.subcategories} ${
            isSubmenuOpen(cat._id, !!cat.subcategories?.length) ? styles.open : ''
          }`}
        >
          {cat.subcategories.map((sub) => (
            <div key={sub._id} className={styles.subcategory}>
              <button
                onClick={() => handleSubcategoryClick(sub._id, cat._id)}
              >
                <span className={styles.title}>
                  {filter.subcategories.includes(sub._id) && (
                    <span className={styles.dots}>
                      <span className={styles.dot}></span>
                      <span className={styles.dot}></span>
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
