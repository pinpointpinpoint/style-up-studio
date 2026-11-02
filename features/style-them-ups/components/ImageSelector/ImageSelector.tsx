'use client'

import {useState} from 'react'
import styles from './ImageSelector.module.css'
import ArrowIcon from '@/features/site-shell/components/ArrowIcon/ArrowIcon'

export type ImageSelectorProps = {
    type: 'head' | 'body' | 'legs'
    images: string[]
    value: string
    onChange: (src: string) => void
}

export default function ImageSelector({type, images, hidden, value, onChange}: ImageSelectorProps & { hidden: boolean }) {
    const currentIndex = Math.max(0, images.indexOf(value))

    function cycle(direction: number) {
        if (!images.length) return

        const nextIndex =
        (currentIndex + direction + images.length) % images.length

        onChange(images[nextIndex])
    }
    
    const options = images.map((src, i) => ({
        src,
        index: i,
        offset: (i - currentIndex + images.length + Math.floor(images.length / 2))
            % images.length - Math.floor(images.length / 2),
    })).sort((a, b) => a.offset - b.offset)

    function renderOption(option: typeof options[number]) {
        return (
            <button
                key={option.src}
                type="button"
                className={styles.option}
                onClick={() => {
                    onChange(option.src);
                }}
                aria-label={`Select ${type} option ${option.index + 1}`}
                tabIndex={-1}
            >
                <img src={option.src} alt="" className={styles.image} />
            </button>
        )
    }

    if (hidden) {
        return null;
    }

    return (
        <div className={styles.selector} role="group" aria-label={`${type} selector`} aria-hidden={hidden}>
            {images.length ? (
                <div className={styles.activeFrame}>
                    <img
                        src={images[currentIndex]}
                        alt={`Selected ${type} option ${currentIndex + 1}`}
                        className={styles.image}
                    />
                    <div className={`${styles.neighbors} ${styles.before}`}>
                        {options.filter(option => option.offset < 0).map(renderOption)}
                    </div>
                    <div className={`${styles.neighbors} ${styles.after}`}>
                        {options.filter(option => option.offset > 0).map(renderOption)}
                    </div>
                    <button
                        className={`${styles.button} ${styles.previous}`}
                        type="button"
                        onClick={() => cycle(-1)}
                        disabled={images.length < 2}
                        aria-label={`Previous ${type}`}
                    >
                        <ArrowIcon direction="left" />
                    </button>
                    <button
                        className={`${styles.button} ${styles.next}`}
                        type="button"
                        onClick={() => cycle(1)}
                        disabled={images.length < 2}
                        aria-label={`Next ${type}`}
                    >
                        <ArrowIcon direction="right" />
                    </button>
                </div>
            ) : <p>No {type} images available.</p>}
        </div>
    )
}
