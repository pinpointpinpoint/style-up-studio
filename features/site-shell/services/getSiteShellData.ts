import 'server-only'
import {cache} from 'react'
import {sanityFetch} from '@/sanity/lib/fetch'
import {createSiteShellService} from './siteShellService'

// Share the shell read between the layout and route during one server render.
export const getSiteShellData = cache(() => createSiteShellService({sanityFetch}).getInitialData())
