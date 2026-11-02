'use client'

import ImageSelector, { ImageSelectorProps } from '@/features/style-them-ups/components/ImageSelector/ImageSelector'
import styles from './ImageBuilder.module.css';
import { useEffect, useRef, useState } from 'react'
import {waitForPageMedia} from '@/features/site-shell/components/IntroGate/waitForPageMedia'
import { useRouter } from 'next/navigation'

type ImageBuilderProps = {
  selectors: Pick<ImageSelectorProps, 'type' | 'images'>[]
}

export default function ImageBuilder({ selectors }: ImageBuilderProps) {
    const builderRef = useRef<HTMLDivElement>(null)
    const [ready, setReady] = useState(false)
    useEffect(() => {
        if (!builderRef.current) return
        return waitForPageMedia(builderRef.current, () => setReady(true))
    }, [])
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
        <div ref={builderRef} className={styles.form} data-collapsed={builderHidden} aria-busy={!ready}>
            <div className={styles.contents} data-intro-media="all" inert={!ready} style={{visibility: ready ? 'visible' : 'hidden'}}>
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
            {!ready && (
                <div className={styles.loading} role="status" aria-label="Loading image builder">
                    <div className={styles.skeletonRows} aria-hidden="true">
                        {['head', 'body', 'legs'].map(part => (
                            <div key={part} className={styles.skeletonRow}>
                            </div>
                        ))}
                    </div>
                    <div className={styles.skeletonFooter} aria-hidden="true">
                    </div>
                </div>
            )}
        </div>
    )
}
