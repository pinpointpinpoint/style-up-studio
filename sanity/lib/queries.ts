import {defineQuery} from 'next-sanity'

export const homePageQuery = defineQuery(`
  *[_type == "home"][0]{
    _id,
    _type,
    overview,
    showcaseProjects[]{
      _key,
      ...@->{
        _id,
        _type,
        coverImage,
        overview,
        "slug": slug.current,
        tags,
        title,
      }
    },
    title,
  }
`)

export const pagesBySlugQuery = defineQuery(`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    _type,
    body,
    overview,
    title,
    "slug": slug.current,
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

export const allProjectsQuery = defineQuery(`
  *[_type == "project"]{
    _id,
    _type,
    featured,
    title,
    date,
    "slug": slug.current,
    credits[]{
      role,
      name,
      link
    },
    videos[]{
      _key,
      title,
      "fileUrl": file.asset->url
    },
    videoUrls[]{
      title,
      url
    },
    coverImage{
      alt,
      ...,
      asset->,
    },
    gallery[]{
      "imageUrl": asset->url,
      caption,
      alt
    },
    "categories": categories[]->{_id, title},
    "subcategory": subcategory->{
      _id, 
      title, 
      "parent": parent->{
        _id,
        title
      }
    },
    description[]
  } | order(date desc)`
)

// export const allCategoriesQuery = defineQuery(`
//     *[_type == "category"]{
//     _id,
//     title
//   }`
// )

// export const allSubCategoriesQuery = defineQuery(`
//   *[_type == "subcategory"]{
//     _id,
//     title,
//     "parent": parent->{_id,title}
//   }`
// )

export const allCategoriesQuery = defineQuery(`
  *[_type == "category"]{
    _id,
    title,
    "referenceCount": count(*[_type in ["project"] && references(^._id)]),
    "subcategories": *[_type == "subcategory" && parent._ref == ^._id]{
      _id,
      title,
      "referenceCount": count(*[_type in ["project"] && references(^._id)])
    }
  }
`)

export const allStyleUpsQuery = defineQuery(`
*[_type == "styleUp"]{
  _id,
  title,
    coverImage{
      alt,
      ...,
      asset->,
    },}
`)