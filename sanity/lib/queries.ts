import {defineQuery} from 'next-sanity'

export const seoSettingsQuery = `
  *[_type == "settings"][0]{
    "description": seo.description
  }
`

export const aboutSectionQuery = `
*[_type == "about"][0]{
    image{
      asset,
      crop,
      hotspot
    },
    bio
  }
`

export const contactSectionQuery = `
  *[_type == "contact"][0]{
    email,
    instagram
  }
`

export const slugsByTypeQuery = defineQuery(`
  *[_type == $type && defined(slug.current)]{"slug": slug.current}
`)

export const allProjectTypesQuery = defineQuery(`
  *[_type == "projectType"]{
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
    featured == true
  ]),
  "allCount": count(*[
    _type == "project"
  ]),
  "settings": {
    "showPersonalities": coalesce(*[_type == "settings"][0].sidebarFilters.showPersonalities, true),
    "showBrands": coalesce(*[_type == "settings"][0].sidebarFilters.showBrands, true)
  },

  "projectTypes": *[
    _type == "projectType"
  ] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    "referenceCount": count(*[
      _type == "project" &&
      references(^._id)
    ])
  },
  "personalities": *[
    _type == "personality"
  ] | order(name asc) {
    _id,
    "title": name,
    "slug": slug.current,
    "referenceCount": count(*[
      _type == "project" &&
      references(^._id)
    ])
  },
  "brands": *[
    _type == "brand"
  ] | order(name asc) {
    _id,
    "title": name,
    "slug": slug.current,
    "referenceCount": count(*[
      _type == "project" &&
      references(^._id)
    ])
  }
}
`)

export const allStyleUpsQuery = defineQuery(`
*[_type == "styleUp"] | order(_createdAt desc) {
  _id,
  name,
  image{
    asset,
    crop,
    hotspot
  },
}
`)

const projectMediaProjection = `
    _key,
    _type,
    asset,
    crop,
    hotspot,
    "title": asset->originalFilename,
    "fileUrl": asset->url,
    url,
    thumbnail{
      asset,
      crop,
      hotspot
    }
`

const projectBaseProjection = `
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
  "previewUrl": previewClip.asset->url,
  coverImage{
    asset,
    crop,
    hotspot
  },
  description[],
  credits[]{
    role,
    "people": select(
      defined(people) => people[]{
        name,
        link
      },
      defined(name) => [{
        "name": name,
        "link": link
      }],
      []
    )
  },
  orderRank
`

const projectProjection = `
  ${projectBaseProjection},
  media[]{
    ${projectMediaProjection}
  }
`

export const projectBySlugQuery = defineQuery(`
  *[
    _type == "project" &&
    slug.current == $slug
  ][0]{
   ${projectProjection}
  }
`)

export const projectsQuery = defineQuery(`
  *[
    _type == "project" &&
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
