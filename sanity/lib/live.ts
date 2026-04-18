import {defineLive} from 'next-sanity/live'
import {client} from './client'
import {token} from './token'


// TODO: spike, do we need live? should we just revalidate
export const {SanityLive, sanityFetch} = defineLive({
  client,
  serverToken: token,
  browserToken: token,
})
