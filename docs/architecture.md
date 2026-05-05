# Architecture

This app follows a server-first read flow:

```text
Sanity CMS -> Sanity fetch boundary -> feature read models -> Next routes/layouts
-> client session hooks -> presentational components
```

Most Sanity reads happen before the UI is rendered. Client components receive typed initial data, then call server actions only for user-driven refreshes such as filtering and pagination.

## Layer Map

```mermaid
flowchart TD
    subgraph CMS["CMS and Generated Types"]
        SanityCMS[(Sanity CMS)]
        Schemas["sanity/schemas/*"]
        GeneratedTypes["sanity.types.ts"]
    end

    subgraph DataBoundary["Data Boundary"]
        Queries["sanity/lib/queries.ts"]
        Client["sanity/lib/client.ts"]
        Fetch["sanityFetch<br/>sanity/lib/fetch.ts"]
    end

    subgraph ReadModels["Feature Read Models"]
        SiteInitial["siteInitialData<br/>features/site-shell/lib"]
        SiteMetadata["siteMetadataReadModel<br/>features/site-shell/lib"]
        ProjectRead["projectReadModel<br/>features/work/lib"]
    end

    subgraph ServerApp["Next Server Layer"]
        SiteLayout["app/(site)/layout.tsx"]
        SiteActions["app/(site)/actions.ts"]
        ProjectRoute["app/(site)/work/[slug]/page.tsx"]
        RevalidateRoute["app/api/revalidate/route.ts"]
    end

    subgraph ClientState["Client State and Sessions"]
        Accordion["SiteSectionsAccordion"]
        WorkRouteSelection["WorkProjectRouteSelection"]
        WorkSession["useWorkBrowsingSession"]
        PureWorkLib["workBrowsingSession<br/>workRouteSelection<br/>workFilterIndex"]
    end

    subgraph UI["Presentation Components"]
        Navbar["Navbar"]
        WorkBrowser["WorkBrowser"]
        Gallery["ProjectGallery"]
        Inspector["WorkInspector"]
        Detail["ProjectDetailView"]
        StyleUps["StyleUps"]
        Video["VideoPlayer"]
    end

    SanityCMS --> Client
    Schemas --> GeneratedTypes
    Queries --> Fetch
    Client --> Fetch
    Fetch --> SiteInitial
    Fetch --> SiteMetadata
    Fetch --> ProjectRead
    ProjectRead --> SiteActions
    SiteInitial --> SiteLayout
    SiteMetadata --> SiteLayout
    SiteActions --> SiteLayout
    SiteActions --> ProjectRoute
    SiteLayout --> Accordion
    ProjectRoute --> WorkRouteSelection
    Accordion --> WorkBrowser
    Accordion --> StyleUps
    WorkRouteSelection --> WorkBrowser
    WorkSession --> PureWorkLib
    WorkBrowser --> WorkSession
    WorkBrowser --> Gallery
    WorkBrowser --> Inspector
    WorkBrowser --> Detail
    Detail --> Video
    SiteLayout --> Navbar
    RevalidateRoute --> Fetch
```

## Initial Site Render

`app/(site)/layout.tsx` owns the first public-site data read. It creates read models, fetches global/site data, fetches the first work page, and passes everything into the client shell.

```mermaid
sequenceDiagram
    participant Browser
    participant Layout as app/(site)/layout.tsx
    participant SiteInitial as siteInitialData read model
    participant Actions as app/(site)/actions.ts
    participant ProjectRead as projectReadModel
    participant Fetch as sanityFetch
    participant Sanity
    participant Accordion as SiteSectionsAccordion
    participant WorkBrowser

    Browser->>Layout: Request public route
    Layout->>SiteInitial: getInitialData()
    par global content
        SiteInitial->>Fetch: about/contact/sidebar/style-ups queries
        Fetch->>Sanity: published CDN reads
        Sanity-->>Fetch: raw CMS data
        Fetch-->>SiteInitial: typed data
    and initial work projects
        SiteInitial->>Actions: getProjects(default filter, page size)
        Actions->>ProjectRead: getProjects(input)
        ProjectRead->>Fetch: projectsQuery or featuredProjectsQuery
        Fetch->>Sanity: published CDN read
        Sanity-->>Fetch: raw projects
        Fetch-->>ProjectRead: query result
        ProjectRead-->>Actions: normalized Project[]
        Actions-->>SiteInitial: Project[]
    end
    SiteInitial-->>Layout: initial site data
    Layout->>Accordion: props
    Accordion->>WorkBrowser: initialProjects, filters, route state
```

## Work Browsing

The work browsing UI is client-side, but data refreshes still go through the server action and read model. The hook owns live browsing state; pure `features/work/lib/*` modules own deterministic calculations.

```mermaid
flowchart TD
    User["User filters or loads more"]
    WorkBrowser["WorkBrowser"]
    SessionHook["useWorkBrowsingSession"]
    PureSession["features/work/lib/workBrowsingSession.ts"]
    FilterIndex["features/work/lib/workFilterIndex.ts"]
    Router["next/navigation router"]
    Action["getProjects server action"]
    ReadModel["projectReadModel.getProjects"]
    Fetch["sanityFetch<br/>tags: public + projects"]
    Sanity[(Sanity CMS)]
    Cache["in-memory pages by filter<br/>Map filter key -> page"]
    Gallery["ProjectGallery"]
    Inspector["WorkInspector"]

    User --> WorkBrowser
    WorkBrowser --> SessionHook
    SessionHook --> PureSession
    PureSession --> FilterIndex
    PureSession --> Router
    PureSession --> Cache

    SessionHook -->|"missing page or load more"| Action
    Action --> ReadModel
    ReadModel --> Fetch
    Fetch --> Sanity
    Sanity --> Fetch
    Fetch --> ReadModel
    ReadModel --> Action
    Action --> SessionHook

    SessionHook --> Cache
    SessionHook --> Gallery
    SessionHook --> Inspector
```

## Project Detail Route

Project details are route-backed. The server route fetches the selected project, then a small client loader stores it in route-selection context so the always-mounted work browser can render the detail view inside the accordion.

```mermaid
sequenceDiagram
    participant User
    participant Route as app/(site)/work/[slug]/page.tsx
    participant Action as getProjectBySlug
    participant ReadModel as projectReadModel
    participant Fetch as sanityFetch
    participant Loader as WorkProjectRouteLoader
    participant Context as WorkProjectRouteSelectionProvider
    participant WorkBrowser
    participant Detail as ProjectDetailView

    User->>Route: Open /work/[slug]
    Route->>Action: getProjectBySlug(slug)
    Action->>ReadModel: getProjectBySlug(slug)
    ReadModel->>Fetch: projectBySlugQuery
    Fetch-->>ReadModel: raw project or null
    ReadModel-->>Action: normalized Project or null
    Action-->>Route: selectedProject

    alt project not found
        Route->>Route: notFound()
    else project found
        Route->>Loader: project prop
        Loader->>Context: applyRouteProject(project)
        Context->>WorkBrowser: routeProject
        WorkBrowser->>Detail: project prop
    end
```

## Cache Invalidation

Public Sanity reads use cache tags only, with no timed revalidation windows. Sanity can invalidate affected tags through the webhook route.

```mermaid
flowchart LR
    Publish["Public content publish in Sanity"]
    Webhook["Sanity webhook"]
    Revalidate["app/api/revalidate/route.ts"]
    Secret["SANITY_REVALIDATE_SECRET check"]
    Tag["revalidateTag(affected tags)"]
    NextRead["Next public read"]
    Fresh["Fresh public data"]

    Publish --> Webhook
    Webhook --> Revalidate
    Revalidate --> Secret
    Secret --> Tag
    Tag --> NextRead
    NextRead --> Fresh
```

## Media Presentation

Project media is fetched as part of project data. Presentation logic chooses how to render images, local videos, and external videos. External video thumbnail fallback is centralized in `features/video/lib/videoMedia.ts`.

```mermaid
flowchart TD
    ProjectData["Project.media[] from Sanity"]
    DetailMedia["projectDetailMediaView.ts"]
    SidebarMedia["projectSidebarMedia.ts"]
    MediaPresentation["projectMediaPresentation.ts"]
    VideoMedia["features/video/lib/videoMedia.ts"]
    ImageUrl["sanityProjectImageUrl.ts"]
    DetailView["ProjectDetailView"]
    Inspector["ProjectInfoPanel"]
    VideoPlayer["VideoPlayer"]
    BrowserFetch["browser fetch/oEmbed when needed"]

    ProjectData --> DetailMedia
    ProjectData --> SidebarMedia
    DetailMedia --> MediaPresentation
    SidebarMedia --> MediaPresentation
    MediaPresentation --> ImageUrl
    MediaPresentation --> VideoMedia
    VideoMedia --> BrowserFetch
    MediaPresentation --> DetailView
    MediaPresentation --> Inspector
    DetailView --> VideoPlayer
```

## Rule of Thumb

New data-backed features should usually follow this shape:

1. Put GROQ in `sanity/lib/queries.ts`.
2. Put fetch orchestration and normalization in the owning feature's `lib/` read model.
3. Use a route, layout, or server action as the server boundary.
4. Pass typed data into client components as props.
5. Put complex interactive state in a hook and deterministic state transitions in a tested feature `lib/` module.
