import type {PortableTextBlock} from 'next-sanity'
import type {Image} from 'sanity'

export interface MilestoneItem {
  _key: string
  description?: string
  duration?: {
    start?: string
    end?: string
  }
  image?: Image
  tags?: string[]
  title?: string
}

export interface ShowcaseProject {
  _id: string
  _type: string
  coverImage?: Image
  overview?: PortableTextBlock[]
  slug?: string
  tags?: string[]
  title?: string
}

export interface AboutPage {
  _id: string
  _type: 'about'
  image?: Image
  blurb?: PortableTextBlock[]
}

export interface ContactPage {
  _id: string
  _type: 'contact'
  email: string
  instagram: string
}