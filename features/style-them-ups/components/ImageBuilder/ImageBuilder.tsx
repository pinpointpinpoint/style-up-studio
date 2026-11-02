'use client'

import ImageSelector, { ImageSelectorProps } from '@/features/style-them-ups/components/ImageSelector/ImageSelector'
import type { Metadata } from 'next'
import styles from './ImageBuilder.module.css';
import { use, useState } from 'react'
import { useRouter } from 'next/navigation'

type ImageBuilderProps = {
  selectors: Pick<ImageSelectorProps, 'type' | 'images'>[]
}

export default function ImageBuilder({ selectors }: ImageBuilderProps) {
    const [builderHidden, setBuilderHidden] = useState(false);
    // find the one with activeFrame true and get its type
    const [selection, setSelection] = useState({
        head: selectors.find(s => s.type === 'head')?.images[0] ?? '',
        body: selectors.find(s => s.type === 'body')?.images[0] ?? '',
        legs: selectors.find(s => s.type === 'legs')?.images[0] ?? '',
    });
    const router = useRouter();

    function toggleImageSelector() {
        setBuilderHidden(!builderHidden);
    }

    function submitSelection() {
        console.log(selection)

        // Send the new submission to the server
        fetch('/api/style-them-ups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(selection),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                router.refresh(); // Refresh the page to show the new submission
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    return (
        <div className={styles.form} data-collapsed={builderHidden}>
            {selectors && selectors.map(({ type, images }) => (
                <ImageSelector key={type} type={type} images={images} hidden={builderHidden} onChange={src =>
                    setSelection(current => ({ ...current, [type]: src }))
                } value={selection[type]} />
            ))}
            <div className={styles.footer}>
                <button onClick={() => router.back()}>[EXIT]</button>
                <button onClick={submitSelection}>[STYLE IT]</button>
                <button onClick={toggleImageSelector}>{builderHidden ? '[EXPAND]' : '[COLLAPSE]'}</button>
            </div>
        </div>
    )
}