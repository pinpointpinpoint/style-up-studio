import type {ProjectsQueryResult} from '@/sanity.types'

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

export type Project = ProjectsQueryResult[number]

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

export interface ProjectType {
  _id: string,
  title: string | null,
  slug: string | null
}

export interface FilterOption {
  _id: string,
  title: string,
  slug: string,
  referenceCount: number
}

export interface CollaboratorFilterOption extends FilterOption {
  filterType: 'brand' | 'personality'
}

export type Filter =
  | {type: 'featured'}
  | {type: 'all'}
  | {type: 'projectType'; id: string}
  | {type: 'brand'; id: string}
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
