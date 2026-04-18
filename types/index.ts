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
  orderRank?: string | null
};

export interface Personality {
  _id: string;
  name: string;
  slug?: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug?: string;
}

export interface Publication {
  _id: string;
  name: string;
  slug?: string;
}

export interface ProjectType {
  _id: string,
  title: string,
  slug: string
}

export interface FilterOption {
  _id: string,
  title: string,
  slug: string,
  referenceCount: number
}

export interface CollaboratorFilterOption extends FilterOption {
  filterType: 'brand' | 'publication' | 'personality'
}

export type Filter =
  | {type: 'featured'}
  | {type: 'all'}
  | {type: 'projectType'; id: string}
  | {type: 'brand'; id: string}
  | {type: 'publication'; id: string}
  | {type: 'personality'; id: string}

export type ProjectCursor =
  | {
      type: 'featured'
      orderRank?: string | null
      id?: string
    }
  | {
      type: 'date'
      date?: string | null
      id?: string
    }

export type ProjectsQueryInput = {
  filter: Filter
  cursor?: ProjectCursor | null
  limit?: number
}

export type SanityAsset = {
  value: {
    url?: string;      
    fileUrl?: string;  
    poster?: string; 
  };
}
