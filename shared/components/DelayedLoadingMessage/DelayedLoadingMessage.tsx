'use client'

import {useEffect, useState, type ReactNode} from 'react'

type DelayedLoadingMessageProps = {
    children?: ReactNode
    delay?: number
}

export default function DelayedLoadingMessage({
    children = '[LOADING...]',
    delay = 300,
}: DelayedLoadingMessageProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timeoutId = window.setTimeout(() => setIsVisible(true), delay)

        return () => window.clearTimeout(timeoutId)
    }, [delay])

    return isVisible ? children : null
}
