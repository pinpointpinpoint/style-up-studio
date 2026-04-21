'use client'

/**
 * This config is used to set up Sanity Studio that's mounted on the `app/studio/[[...index]]/page.tsx` route
 */
import {apiVersion, dataset, projectId, studioUrl} from '@/sanity/lib/api'
import {pageStructure, singletonPlugin} from '@/sanity/plugins/settings'
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
    // If you want more content types, you can add them to this array
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
    // presentationTool({
    //   resolve,
    //   previewUrl: {previewMode: {enable: '/api/draft-mode/enable'}},
    // }),
    // Configures the global "new document" button, and document actions, to suit the Settings document singleton
    singletonPlugin([settings.name, about.name, contact.name]),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    // visionTool({defaultApiVersion: apiVersion}),
    ...(process.env.NODE_ENV === 'development'
      ? [visionTool({ defaultApiVersion: apiVersion })]
      : []),
  ],
})