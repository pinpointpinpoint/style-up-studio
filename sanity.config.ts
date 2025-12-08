'use client'

/**
 * This config is used to set up Sanity Studio that's mounted on the `app/studio/[[...index]]/page.tsx` route
 */
import {apiVersion, dataset, projectId, studioUrl} from '@/sanity/lib/api'
import * as resolve from '@/sanity/plugins/resolve'
import {pageStructure, singletonPlugin} from '@/sanity/plugins/settings'
import page from '@/sanity/schemas/documents/page'
import project from '@/sanity/schemas/documents/project'
import duration from '@/sanity/schemas/objects/duration'
import milestone from '@/sanity/schemas/objects/milestone'
import timeline from '@/sanity/schemas/objects/timeline'
import about from '@/sanity/schemas/singletons/about'
import home from '@/sanity/schemas/singletons/home'
import settings from '@/sanity/schemas/singletons/settings'
import contact from './sanity/schemas/singletons/contact'
import category from './sanity/schemas/objects/category'
import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'
import galleryImage from './sanity/schemas/objects/galleryImage'
import subcategory from './sanity/schemas/objects/subcategory'
import styleup from './sanity/schemas/documents/styleup'

const title =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'Next.js Personal Website with Sanity.io'

export default defineConfig({
  basePath: studioUrl,
  projectId: projectId || '',
  dataset: dataset || '',
  title,
  schema: {
    // If you want more content types, you can add them to this array
    types: [
      // Singletons
      home,
      settings,
      about,
      contact,
      // Documents
      duration,
      page,
      project,
      category,
      subcategory,
      styleup,
      // Objects
      milestone,
      timeline,
      galleryImage
    ],
  },
  plugins: [
    structureTool({
      structure: pageStructure([home, settings, about, contact]),
    }),
    presentationTool({
      resolve,
      previewUrl: {previewMode: {enable: '/api/draft-mode/enable'}},
    }),
    // Configures the global "new document" button, and document actions, to suit the Settings document singleton
    singletonPlugin([home.name, settings.name, about.name, contact.name]),
    // Add an image asset source for Unsplash
    unsplashImageAsset(),
    // Vision lets you query your content with GROQ in the studio
    // https://www.sanity.io/docs/the-vision-plugin
    // visionTool({defaultApiVersion: apiVersion}),
    ...(process.env.NODE_ENV === 'development'
      ? [visionTool({ defaultApiVersion: apiVersion })]
      : []),
    
    
  ],
})
