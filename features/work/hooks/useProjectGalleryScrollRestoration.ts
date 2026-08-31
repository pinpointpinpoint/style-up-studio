'use client'

import {useEffect, type RefObject} from 'react'

const PROJECT_GALLERY_SCROLL_STORAGE_KEY = 'projectGalleryScrollY'

export function useProjectGalleryScrollRestoration(
    galleryRef: RefObject<HTMLDivElement | null>,
) {
    useEffect(() => {
        const gallery = galleryRef.current
        if (!gallery) return

        const savedScrollY = sessionStorage.getItem(PROJECT_GALLERY_SCROLL_STORAGE_KEY)
        if (savedScrollY) gallery.scrollTop = Number(savedScrollY)

        const handleScroll = () => {
            sessionStorage.setItem(
                PROJECT_GALLERY_SCROLL_STORAGE_KEY,
                String(gallery.scrollTop),
            )
        }

        gallery.addEventListener('scroll', handleScroll, {passive: true})

        return () => gallery.removeEventListener('scroll', handleScroll)
    }, [galleryRef])
}
