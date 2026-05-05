import { StructureBuilder } from 'sanity/structure'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { 
  BookmarkFilledIcon,
  CogIcon,
  ComposeSparklesIcon, EnvelopeIcon, FolderIcon, ProjectsIcon, StarFilledIcon, TagIcon, UserIcon, 
  UsersIcon
} from '@sanity/icons'

export const customPageStructure = (S: StructureBuilder, context: any) => {
  return S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('settings').documentId('settings')),
      S.divider(),
      S.listItem()
        .title('About')
        .icon(UserIcon)
        .child(S.document().schemaType('about').documentId('about')),
      S.listItem()
        .title('Contact')
        .icon(EnvelopeIcon)
        .child(S.document().schemaType('contact').documentId('contact')),
      S.divider(),
      orderableDocumentListDeskItem({
        type: 'project',
        title: 'Featured Projects',
        icon: BookmarkFilledIcon,
        filter: '_type == "project" && featured == true',
        S,
        context,
      }),
      S.listItem()
        .title('All Projects')
        .icon(ProjectsIcon)
        .child(S.documentTypeList('project').title('Projects')),
      S.listItem()
        .title('Style Ups')
        .icon(StarFilledIcon)
        .child(S.documentTypeList('styleUp').title('Style Ups')),
      S.listItem()
        .title('Remix Wall')
        .icon(ComposeSparklesIcon)
        .child(S.documentTypeList('post').title('Remix Wall')),
      S.divider(),
      S.listItem()
        .title('Project Type')
        .icon(FolderIcon)
        .child(S.documentTypeList('projectType').title('Project Type')),
      S.divider(),
      S.listItem()
        .title('Personalities')
        .icon(UsersIcon)
        .child(S.documentTypeList('personality').title('Personalities')),
      S.listItem()
        .title('Brands')
        .icon(TagIcon)
        .child(S.documentTypeList('brand').title('Brands'))
    ])
}