'use client'

import {apiVersion, dataset, projectId, studioUrl} from '@/sanity/lib/api'
import {singletonPlugin} from '@/sanity/plugins/singletonPlugin'
import project from '@/sanity/schemas/documents/project'
import about from '@/sanity/schemas/singletons/about'
import contact from './sanity/schemas/singletons/contact'
import projectType from './sanity/schemas/taxonomy/projectType'
import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import styleup from './sanity/schemas/documents/styleup'
import post from './sanity/schemas/documents/post'
import { customPageStructure } from './sanity/deskStructure'
import personality from './sanity/schemas/documents/personality'
import brand from './sanity/schemas/documents/brand'
import settings from './sanity/schemas/singletons/settings'

const title =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE

export default defineConfig({
  basePath: studioUrl,
  projectId: projectId || '',
  dataset: dataset || '',
  title,
  schema: {
    types: [
      // Singletons
      settings,
      about,
      contact,
      // Documents
      project,
      styleup,
      post,
      personality,
      brand,
      // Taxonomy
      projectType
    ],
  },
  plugins: [
    structureTool({
      structure: customPageStructure
    }),
    singletonPlugin([settings.name, about.name, contact.name]),
    ...(process.env.NODE_ENV === 'development'
      ? [visionTool({ defaultApiVersion: apiVersion })]
      : []),
  ],
})