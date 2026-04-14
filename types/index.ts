import type {PortableTextBlock} from 'next-sanity'
import type {Image} from 'sanity'

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
  _key: string
}

export interface Credit {
  link?: string;
  name: string;
  role: string;
}

export interface Project {
  _id: string;
  _type: string;
  title: string;
  client: string;
  date: string;
  slug: string;
  projectType: ProjectType[];
  featured?: boolean;
  personalities: Personality[];
  brands: Brand[];
  publications: Publication[];
  gallery?: Image[];
  videos?: Video[];
  videoUrls?: VideoUrls[];
  coverImage: Image;
  description?: PortableTextBlock[];
  credits?: Credit[];
};

export interface Personality {
  _id: string;
  name: string;
}

export interface Brand {
  _id: string;
  name: string;
}

export interface Publication {
  _id: string;
  name: string;
}

export interface ProjectType {
  _id: string,
  title: string,
  referenceCount: number
}

export interface Subcategory {
  _id: string,
  title: string,
  parent: ProjectType,
  referenceCount: number
}

export type Filter = {
  category: string
  subcategories: string[]
}

export type SanityAsset = {
  value: {
    url?: string;      
    fileUrl?: string;  
    poster?: string; 
  };
}