import {NextResponse, type NextRequest} from 'next/server'

export function proxy(request: NextRequest) {
    const headers = new Headers(request.headers)
    // Seed the persistent layout with the correct filter on a direct visit.
    headers.set('x-site-pathname', request.nextUrl.pathname)
    return NextResponse.next({request: {headers}})
}

export const config = {
    matcher: ['/', '/work/:path*', '/style-ups'],
}
