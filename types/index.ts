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

export interface Video {
  fileUrl: string,
  title?: string,
  _key: string
}

export interface VideoUrls {
  url: string,
  title?: string,
}

export interface Credit {
  link?: string;
  name: string;
  role: string;
}

export interface Project {
  _id: string;
  _type: string;
  featured?: boolean;
  title: string;
  slug: string;
  date: string;
  categories: SingleCategory[];
  subcategory?: Subcategory;
  coverImage: Image;
  gallery?: Image[];
  description?: PortableTextBlock[];
  videoUrls?: VideoUrls[];
  videos?: Video[];
  credits?: Credit[];
};

export interface SingleCategory {
  _id: string,
  title: string,
}

export interface Category {
  _id: string,
  title: string,
  subcategories?: Subcategory[]
}

export interface Subcategory {
  _id: string,
  title: string,
  parent: SingleCategory
}