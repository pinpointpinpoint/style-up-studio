'use client'

import {useEffect} from 'react'

export default function VidstackRejectionHandler() {
    useEffect(() => {
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const message =
                event.reason instanceof Error
                    ? event.reason.message
                    : String(event.reason ?? '')

            if (message === 'provider destroyed') {
                event.preventDefault()
            }
        }

        window.addEventListener('unhandledrejection', handleUnhandledRejection)

        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection)
        }
    }, [])

    return null
}