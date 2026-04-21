import {defineQuery} from 'next-sanity'

export const homePageQuery = defineQuery(`
  *[_type == "home"][0]{
    _id,
    _type,
    overview,
    title,
  }
`)

export const seoSettingsQuery = `
  *[_type == "settings"][0]{
    "description": seo.description
  }
`

export const slugsByTypeQuery = defineQuery(`
  *[_type == $type && defined(slug.current)]{"slug": slug.current}
`)

export const allProjectTypesQuery = defineQuery(`
  *[_type == "projectType" && !(_id in path("drafts.**"))]{
    _id,
    title,
    "slug": slug.current,
    "referenceCount": count(*[_type in ["project"] && references(^._id)]),
  }
`)

export const sidebarFiltersQuery = defineQuery(`
{
  "featuredCount": count(*[
    _type == "project" &&
    featured == true &&
    !(_id in path("drafts.**"))
  ]),
  "allCount": count(*[
    _type == "project" &&
    !(_id in path("drafts.**"))
  ]),

  "projectTypes": *[
    _type == "projectType" &&
    !(_id in path("drafts.**"))
  ] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    "referenceCount": count(*[
      _type == "project" &&
      !(_id in path("drafts.**")) &&
      references(^._id)
    ])
  },
  "personalities": *[
    _type == "personality" &&
    !(_id in path("drafts.**"))
  ] | order(name asc) {
    _id,
    "title": name,
    "slug": slug.current,
    "referenceCount": count(*[
      _type == "project" &&
      !(_id in path("drafts.**")) &&
      references(^._id)
    ])
  },
  "brands": *[
    _type == "brand" &&
    !(_id in path("drafts.**"))
  ] | order(name asc) {
    _id,
    "title": name,
    "slug": slug.current,
    "referenceCount": count(*[
      _type == "project" &&
      !(_id in path("drafts.**")) &&
      references(^._id)
    ])
  }
}
`)

export const allStyleUpsQuery = defineQuery(`
*[_type == "styleUp" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
  _id,
  name,
  image{
    asset,
    crop,
    hotspot
  },
}
`)

const projectProjection = `
  _id,
  _type,
  title,
  client,
  date,
  "slug": slug.current,
  "projectType": projectType[]->{_id, title, "slug": slug.current},
  featured,
  "personalities": personalities[]->{_id, name, "slug": slug.current},
  "brands": brands[]->{_id, name, "slug": slug.current},
  gallery[]{
    _key,
    asset,
    crop,
    hotspot
  },
  "previewUrl": previewClip.asset->url,
  videos[]{
    _key,
    "title": asset->originalFilename,
    "fileUrl": asset->url,
    thumbnail{
      asset,
      crop,
      hotspot
    }
  },
  videoUrls[]{
    _key,
    title,
    url,
    thumbnail{
      asset,
      crop,
      hotspot
    }
  },
  coverImage{
    asset,
    crop,
    hotspot
  },
  description[],
  credits[]{
    role,
    name,
    link
  },
  orderRank
`

export const projectBySlugQuery = defineQuery(`
  *[
    _type == "project" &&
    !(_id in path("drafts.**")) &&
    slug.current == $slug
  ][0]{
   ${projectProjection}
  }
`)

export const projectsQuery = defineQuery(`
  *[
    _type == "project" &&
    !(_id in path("drafts.**")) &&
    (
      $filterType == "all" ||
      ($filterType == "featured" && featured == true) ||
      ($filterType == "projectType" && $filterId in projectType[]._ref) ||
      ($filterType == "brand" && $filterId in brands[]._ref) ||
      ($filterType == "personality" && $filterId in personalities[]._ref)
    ) &&
    (
      !defined($cursorDate) ||
      $cursorId == "" ||
      date < $cursorDate ||
      (date == $cursorDate && _id < $cursorId)
    )
  ]
  | order(date desc, _id desc)
  [0...$limit]{
   ${projectProjection}
  }
`)

export const featuredProjectsQuery = defineQuery(`
*[
    _type == "project" &&
    !(_id in path("drafts.**")) &&
      featured == true &&
    (
      $cursorId == "" ||
      coalesce(orderRank, "~~~~") > coalesce($cursorOrderRank, "~~~~") ||
      (
        coalesce(orderRank, "~~~~") == coalesce($cursorOrderRank, "~~~~") &&
        _id > $cursorId
      )
    )
  ]
  | order(coalesce(orderRank, "~~~~") asc, _id asc)[0...$limit] {
   ${projectProjection}
  }
`)
