# Project Name

This is the official portfolio site for Style Up Studio, created by Pinpoint Studio. The site highlights Angie's work with a clean, interactive, and responsive design. It’s built to be easy to update, scalable, and provide a smooth browsing experience across all devices.

---

## Tech Stack

- Framework: Next.js  
- CMS: Sanity  
- Database: Supabase
- Media: Vidstack 
- Hosting: Vercel  

---

## Getting Started

### 1. Clone the repo
`git clone https://github.com/pinpointpinpoint/style-up-studio`
`cd style-up-studio`

### 2. Install dependencies
`npm install`

### 3. Environment variables

Create a `.env.local` file:

NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER=
NEXT_PUBLIC_VERCEL_GIT_PROVIDER=
NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG=

NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=

SANITY_API_READ_TOKEN=
SANITY_API_WRITE_TOKEN=

NEXT_PUBLIC_SANITY_PROJECT_TITLE="Style Up Studio"

### 4. Run development server

`nvm use 22`

`npm run dev`

App runs on `http://localhost:3000`

Sanity CMS runs on `http://localhost:3000/admin`

---

## Project Overview

- Portfolio projects are fetched from Sanity CMS  
- Projects support images and video  
- Infinite scroll is used for progressive loading  
- Featured projects are prioritized on first load  

---

## Folder Structure

/app            # Next.js app router  
/components     # Reusable UI components  
/hooks          # Custom React hooks  
/public         # Public assets
/sanity         # Sanity CMS
/styles         # Global styles  
/types          # TypeScript types  
/utils          # Utilities (CMS clients, helpers)  

---

## Data Fetching Strategy

- Initial load fetches:
  - Featured projects
  - First page of all projects
- Additional projects:
  - Loaded via infinite scroll
  - Cached in memory to avoid duplicate requests
- Filtering:
  - Uses already-fetched data when possible
  - Only fetches new data if category not yet loaded

---

## Media Handling

- Videos handled with custom player  
- Posters used for performance and UX  
- External embeds (e.g., YouTube) normalized  

---

## Performance Considerations

- Lazy loading for media  
- Infinite scroll instead of pagination  
- Avoid duplicate API calls  
- Client-side caching of project data  

---

## Key Components

- `Work` → layout + infinite scroll  
- `Thumbnail` → hover + preview logic  
- `VideoPlayer` → custom playback
- `Sidebar` → filtering logic, project information 

---

## Scripts

`npm run dev`      # Start dev server  
`npm run build`     # Production build  
`npm run start`     # Run production server  
`npm run lint`      # Lint code  

---

## Deployment

Deployed on Vercel:

`npm run build`

Make sure environment variables are set in the deployment platform.

---

## Known Limitations

- External video embeds may fail (e.g., age-restricted content)  
- Large media files may impact load times  
- Filtering relies on previously fetched data  

---

## License

This codebase is the property of Style Up Studio and is provided by Pinpoint Studio.  
All rights and ownership are transferred to Style Up Studio upon delivery of the project.  

Use, modification, and deployment rights belong exclusively to Style Up Studio after transfer. Redistribution or sharing without written permission is prohibited.