'use client'

import {useEffect, useState} from 'react'
import styles from './ImageSelector.module.css'
import ArrowIcon from '@/features/site-shell/components/ArrowIcon/ArrowIcon'

type ImageSelectorProps = {
  type: 'head' | 'body' | 'legs'
  images: string[]
  onChange: (image: string) => void
}

export default function ImageSelector({type, images, onChange}: ImageSelectorProps) {
  const [index, setIndex] = useState(0)
  const currentIndex = images.length ? index % images.length : 0

  function cycle(direction: number) {
    setIndex(current => (current + direction + images.length) % images.length)
    onChange(images[currentIndex])
  }

  return (
    <section className={styles.selector} data-type={type} aria-label={`${type} selector`}>
      {images.length ? (
        <>
          <button className={styles.button} type="button" onClick={() => cycle(-1)} disabled={images.length < 2} aria-label={`Previous ${type}`}><ArrowIcon direction="left" /></button>
          <img src={images[currentIndex]} alt={`${type} option ${currentIndex + 1}`}
            className={styles.image} />
          <button className={styles.button} type="button" onClick={() => cycle(1)} disabled={images.length < 2} aria-label={`Next ${type}`}><ArrowIcon direction="right" /></button>
        </>
      ) : <p className={styles.empty}>No {type} images available.</p>}
    </section>
  )
}
