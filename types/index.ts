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

export interface Project {
  _id: string
  _type: 'project'
  featured: boolean
  title: string
  slug: {
    _type: 'slug'
    current: string
  }
  date: string // ISO date string
  categories: {
    _id: string,
    title: string
  }[], // Or you can make this a reference type if you fetch category data (what does. that mean?)
  subcategory: {
    _id: string,
    title: string,
    parent: {
      _id: string
      title: string
    }
  },  // optional
  coverImage: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
    alt?: string | null
  }
  gallery?: {
    _type: 'image'
    asset: {
      _ref: string
      _type: 'reference'
    }
    alt?: string | null
  }[]
  description?: PortableTextBlock[]
  videoUrls?: {
    title?: string
    url: string
  }[]
  videos?: {
    _type: 'video'
    _key: string
    title?: string
    fileUrl: string
  }[]
  credits?: {
    role: string
    name: string
    link?: string
  }[]
}

export interface Category {
  _id: string,
  title: string,
  subcategories?: Subcategory[]
}

export interface Subcategory {
  _id: string,
  title: string,
  parent: {
    _id: string
    title: string
  }
}