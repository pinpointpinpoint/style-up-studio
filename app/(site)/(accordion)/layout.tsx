import {headers} from 'next/headers'
import {getProjects} from '@/app/(site)/actions'
import {createWorkIndexCatalog} from '@/features/work/lib/workIndex'
import {PROJECTS_PAGE_SIZE} from '@/features/work/lib/constants'
import SiteSectionsAccordion from '@/features/site-shell/components/SiteSectionsAccordion/SiteSectionsAccordion'
import {getSiteShellData} from '@/features/site-shell/services/getSiteShellData'
import Navbar from '@/features/site-shell/components/Navbar/Navbar'
import {SiteRouteSelectionProvider} from '@/features/site-shell/routing/SiteRouteSelectionProvider'

export default async function AccordionLayout({children}: {children: React.ReactNode}) {
    const {about, contact, sidebarFilters} = await getSiteShellData()
    const pathname = (await headers()).get('x-site-pathname') ?? '/'
    const initialFilter = createWorkIndexCatalog(sidebarFilters).parsePath(pathname)
    const initialProjects = await getProjects({filter: initialFilter, limit: PROJECTS_PAGE_SIZE})
    return (
        <div className="site">
            <SiteRouteSelectionProvider>
                <Navbar about={about} contact={contact} />
                <SiteSectionsAccordion
                    initialProjects={initialProjects}
                    initialFilter={initialFilter}
                    sidebarFilters={sidebarFilters}
                >
                    {children}
                </SiteSectionsAccordion>
            </SiteRouteSelectionProvider>
        </div>
    )
}
