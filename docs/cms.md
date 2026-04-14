# CMS Guide

Reference for the Sanity CMS implementation in this project.

## Document Control

- **Owner:** Pinpoint Studio
- **Last Updated:** 2026-04-03
- **CMS Platform:** Sanity Studio (embedded at `/admin`)
- **Code Owners:** Tiffany Bouchard

## Scope

This document covers:

- Schema structure and file organization
- Content types and editorial intent
- Relationships and reference model
- Slug policy
- Rich text policy
- Change management and QA checklist

## CMS Architecture At A Glance

- **Studio Config:** [`sanity.config.ts`](/Users/tiffanybouchard/Pinpoint/style-up-studio/sanity.config.ts)
- **Desk Structure:** [`sanity/deskStructure.ts`](/Users/tiffanybouchard/Pinpoint/style-up-studio/sanity/deskStructure.ts)
- **Schemas Root:** `sanity/schemas`
- **Schema JSON Snapshot:** [`schema.json`](/Users/tiffanybouchard/Pinpoint/style-up-studio/schema.json)

### Schema Folder Structure

- `sanity/schemas/singletons` for one-off site documents (global pages/settings)
- `sanity/schemas/documents` for repeatable content entries
- `sanity/schemas/taxonomy` for classification documents

## Content Model Inventory

### Singletons

| Schema | File | Purpose | Frontend Surface |
|---|---|---|---|
| `settings` | `sanity/schemas/singletons/settings.ts` | Global site metadata and SEO description | Site-level metadata |
| `about` | `sanity/schemas/singletons/about.ts` | About page content and image | About page |
| `contact` | `sanity/schemas/singletons/contact.ts` | Contact info and Instagram URL | Contact page/footer |

### Documents

| Schema | File | Purpose | Frontend Surface |
|---|---|---|---|
| `project` | `sanity/schemas/documents/project.ts` | Core portfolio/project entries | Project listing + detail pages |
| `styleUp` | `sanity/schemas/documents/styleup.ts` | Style-up gallery entries | Style Up section |
| `post` | `sanity/schemas/documents/post.ts` | Remix Wall item feed | Remix Wall |
| `personality` | `sanity/schemas/documents/personality.ts` | Referenced collaborator entities | Project collaborators |
| `brand` | `sanity/schemas/documents/brand.ts` | Referenced brand entities | Project collaborators |
| `publication` | `sanity/schemas/documents/publication.ts` | Referenced publication entities | Project collaborators |

### Taxonomy

| Schema | File | Purpose | Used By |
|---|---|---|---|
| `projectType` | `sanity/schemas/taxonomy/projectType.ts` | Category/classification for projects | `project.projectType` |

## Detailed Content Type Notes

### `project` (Primary Content Type)

Required core fields:

- `title`
- `client`
- `date`
- `slug`
- `projectType` (reference)
- `coverImage`

Notable behavior:

- Uses fieldsets for editorial grouping: `basic`, `collaborators`, `media`, `content`
- Enforces at least one media source via custom validation across `gallery`, `videos`, `videoUrls`
- Supports optional collaborator references: `personalities`, `publications`, `brands`
- Supports optional rich content fields: `description`, `credits`
- Supports ordering with `orderRankField` and custom date orderings

### `styleUp`

- Simple document model with title/date/gallery/cover image
- No slug currently defined
- Gallery supports captions and alt text

### `post` (Remix Wall)

- Lightweight feed document with `name`, `imageUrl`, `postedAt`
- `imageUrl` is required

## Relationship Model

### Reference Graph

- `project.projectType` -> `projectType`
- `project.personalities[]` -> `personality`
- `project.publications[]` -> `publication`
- `project.brands[]` -> `brand`

### Cardinality Rules

- One project must have exactly one `projectType`
- One project may have zero to many collaborator references in each collaborator array
- Reference arrays enforce uniqueness at array level

## Slug Policy

Current implementation:

- Slugs exist on `project` only
- Source field: `title`
- Max length: `96`
- Required for publish

Agency standard:

- Slug should be stable once published
- Avoid date prefixes unless URL versioning is required
- If title changes post-publish, keep existing slug unless redirect strategy is in place

## Rich Text Policy

Current rich text fields:

- `project.description` (portable text)
- `settings.overview` (portable text)
- `about.blurb` (portable text)

Allowed formatting currently emphasizes:

- Paragraph-style blocks
- Inline links
- Limited decorators (`em`, `strong`) on some schemas
- Minimal/no custom style variants

Agency standard recommendations:

- Keep editor options intentionally limited to protect design consistency
- Document any added decorators/styles before enabling them
- Validate editorial max lengths where content impacts SEO or layout

## Media Standards

- Prefer descriptive filenames before upload
- Add `alt` text wherever available in schema
- Use `coverImage` as canonical listing thumbnail
- For video content, accept either uploaded `mp4` or external URL entries

Suggested operating rule:

- Every publishable visual entry should have a clear fallback image for cards/social previews

## Desk Structure And Editorial UX

Configured in [`sanity/deskStructure.ts`](/Users/tiffanybouchard/Pinpoint/style-up-studio/sanity/deskStructure.ts):

- Singletons pinned at top (`Settings`, `About`, `Contact`)
- Curated list for `Featured Projects` (`project.featured == true`)
- Full lists for `All Projects`, `Style Ups`, `Remix Wall`
- Taxonomy/lookup entities grouped below

## Change Management (Agency Standard)

When adding or changing CMS schema:

1. Update schema file in `sanity/schemas/...`
2. Register type in [`sanity.config.ts`](/Users/tiffanybouchard/Pinpoint/style-up-studio/sanity.config.ts) if new
3. Update desk structure if editors need curated navigation
4. Regenerate schema types if your workflow uses generated types
5. Update this document (`docs/cms.md`) with:
   - new fields
   - validation behavior
   - relationship implications
   - migration notes

## QA Checklist Before Release

- [ ] Required fields correctly enforce publish blocking
- [ ] Reference targets exist and are selectable
- [ ] Slug generation and uniqueness behave as expected
- [ ] Rich text renders correctly on frontend
- [ ] New fields are fetched in GROQ queries
- [ ] New fields are typed in TypeScript layer if applicable
- [ ] Desk structure remains clear for non-technical editors

## Migration Notes Template

Use this section when schema changes affect existing content.

- **Change:** [Describe field/schema change]
- **Impact:** [Who/what breaks if no migration]
- **Backfill Needed:** Yes/No
- **Script/Method:** [Manual, script, Sanity migration]
- **Rollback Plan:** [How to revert safely]
- **Date Implemented:** [YYYY-MM-DD]
- **Owner:** [Name]

## Open Decisions

- [ ] Should `styleUp` receive a slug for dedicated detail routes?
- [ ] Should collaborator schemas (`personality`, `brand`, `publication`) enforce required `name` validation?
- [ ] Should `post.imageUrl` move to Sanity `image` type for asset control and optimization?

