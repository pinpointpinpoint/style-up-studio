import {defineQuery} from 'next-sanity'

export const homePageQuery = defineQuery(`
  *[_type == "home"][0]{
    _id,
    _type,
    overview,
    title,
  }
`)

export const projectBySlugQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    _type,
    client,
    coverImage,
    description,
    duration,
    overview,
    site,
    "slug": slug.current,
    tags,
    title,
  }
`)

export const settingsQuery = defineQuery(`
  *[_type == "settings"][0]{
    _id,
    _type,
    footer,
    menuItems[]{
      _key,
      ...@->{
        _type,
        "slug": slug.current,
        title
      }
    },
    ogImage,
  }
`)

export const slugsByTypeQuery = defineQuery(`
  *[_type == $type && defined(slug.current)]{"slug": slug.current}
`)

// Projects query with cursor pagination and project type/collaborators filtering
export const projectsQuery = defineQuery(`
  *[
    _type == "project" &&
    !(_id in path("drafts.**")) &&

    // Category filter
    (
      $category == "all" ||
      featured == true ||
      ($category != "all" && $category != "featured" && references($category))
    ) &&

    // Subcategory filter
    (
      count($subcategoryIds) == 0 ||
      subcategory._ref in $subcategoryIds
    ) &&

    // Cursor pagination
    (
      !defined($cursorDate) ||
      date < $cursorDate ||
      (date == $cursorDate && _id < $cursorId)
    )
  ]
  | order(date desc, _id desc)
  [0...$limit]{
    _id,
    _type,
    featured,
    title,
    date,
    "slug": slug.current,
    coverImage{
      alt,
      ...,
      asset->
    },
    "projectType": projectType[]->{_id, title},
    "subcategory": subcategory->{_id, title},
    description[],
    credits[]{role, name, link},
    videos[]{_key, title, "fileUrl": file.asset->url},
    videoUrls[]{_key, title, url}
  }
`)


// COMPLETED
export const featuredProjectsQuery = defineQuery(`
  *[_type == "project" && featured == true && !(_id in path("drafts.**"))]
  | order(orderRank asc, date desc){
    _id,
    _type,
    title,
    client,
    date,
    "slug": slug.current,
    "projectType": projectType[]->{_id, title},
    featured,
    "personalities": personalities[]->{_id, name},
    "brands": brands[]->{_id, name},
    "publications": publications[]->{_id, name},
    gallery[]{
      _key,
      "imageUrl": asset->url,
      caption,
      alt
    },
    videos[]{
      _key,
      title,
      "fileUrl": file.asset->url
    },
    videoUrls[]{
      _key,
      title,
      url
    },
    coverImage{
      alt,
      ...,
      asset->,
    },
    description[],
    credits[]{
      role,
      name,
      link
    },
  }`
)

// COMPLETED
export const allProjectTypesQuery = defineQuery(`
  *[_type == "projectType" && !(_id in path("drafts.**"))]{
    _id,
    title,
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
    "referenceCount": count(*[
      _type == "project" &&
      !(_id in path("drafts.**")) &&
      references(^._id)
    ])
  },
  "publications": *[
    _type == "publication" &&
    !(_id in path("drafts.**"))
  ] | order(title asc) {
    _id,
    title,
    "referenceCount": count(*[
      _type == "project" &&
      !(_id in path("drafts.**")) &&
      references(^._id)
    ])
  },
  "brands": *[
    _type == "brand" &&
    !(_id in path("drafts.**"))
  ] | order(title asc) {
    _id,
    title,
    "referenceCount": count(*[
      _type == "project" &&
      !(_id in path("drafts.**")) &&
      references(^._id)
    ])
  }
}
`)



export const allStyleUpsQuery = defineQuery(`
*[_type == "styleUp" && !(_id in path("drafts.**"))
]{
  _id,
  title,
    coverImage{
      alt,
      ...,
      asset->,
    },}
`)