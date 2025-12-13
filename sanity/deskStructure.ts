import {StructureBuilder} from 'sanity/structure'
import { ConfettiIcon, EnvelopeIcon, FolderIcon, HomeIcon, ProjectsIcon, StarFilledIcon, UserIcon } from '@sanity/icons'

export const customPageStructure = (S: StructureBuilder) => {
  return S.list()
    .title('Content')
    .items([
      // Section 1: Home, About, Contact
      S.listItem()
        .title('Home')
        .icon(HomeIcon) // <--- add this line
        .child(S.document().schemaType('home').documentId('home')),
      S.listItem()
        .title('About')
        .icon(UserIcon) // <--- add this line
        .child(S.document().schemaType('about').documentId('about')),
      S.listItem()
        .title('Contact')
        .icon(EnvelopeIcon) // <--- add this line
        .child(S.document().schemaType('contact').documentId('contact')),

      S.divider(), // First divider

      // Section 2: Project, Style Up, Remix Wall
      S.listItem()
        .title('Project')
        .icon(ProjectsIcon) // <--- add this line
        .child(S.documentTypeList('project').title('Projects')),
      S.listItem()
        .title('Style Up')
        .icon(StarFilledIcon) // <--- add this line
        .child(S.documentTypeList('styleUp').title('Style Up')),
      S.listItem()
        .title('Remix Wall')
        .icon(ConfettiIcon) // <--- add this line
        .child(S.documentTypeList('post').title('Remix Wall')),

      S.divider(), // Second divider

      // Section 3: Category / Subcategory
      S.listItem()
        .title('Category')
        .icon(FolderIcon) // <--- add this line
        .child(S.documentTypeList('category').title('Categories')),
      S.listItem()
        .title('Subcategory')
        .icon(FolderIcon) // <--- add this line
        .child(S.documentTypeList('subcategory').title('Subcategories')),
    ])
}