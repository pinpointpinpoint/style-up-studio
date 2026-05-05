# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 and Sanity portfolio site written in TypeScript. App routes live in `app/`, with the public site under `app/(site)`, Sanity Studio under `app/(admin)/admin/[[...index]]`, and API handlers under `app/api`. Product code is organized by feature in `features/`: reusable UI belongs in each feature's `components/`, interaction hooks in `hooks/`, domain/session logic in `lib/`, and larger named subdomains such as work media can use their own folder like `features/work/media/`. Cross-feature helpers belong in `shared/`, shared React contexts in `contexts/`, global styles in `app/globals.css` and `styles/`, and shared types in `types/`. Sanity clients, schemas, desk structure, and CMS plugins live in `sanity/`. Static assets, fonts, logos, shapes, and videos belong in `public/`; documentation is in `docs/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies; Node `>=22.12.0` is required.
- `npm run dev`: generate Sanity types via `predev`, then start the Turbopack dev server at `http://localhost:3000`.
- `npm run build`: create a production build and extract the Sanity manifest into `public/studio/static`.
- `npm run start`: serve the production build locally.
- `npm run lint`: run ESLint over the repository.
- `npm run type-check`: run Next type generation and `tsc --noEmit`.
- `npm test`: run the Vitest test suite once.
- `npm run typegen`: regenerate Sanity schema and TypeScript types after schema changes.
- `npm run format`: format files with Prettier.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Match existing naming: feature components use PascalCase directories and files such as `features/site-shell/components/Navbar/Navbar.tsx`, hooks use `useThing.tsx`, and route folders follow App Router conventions. CSS Modules sit beside components as `Component.module.css`. Keep domain-specific helpers in the owning feature's `lib/` or a named feature subfolder; keep small generic helpers in `shared/utils/`. Prettier uses the Sanity preset with `tabWidth: 4`, import sorting, and Tailwind class sorting. Run `npm run lint:fix` before larger PRs.

## Testing Guidelines

Vitest is configured via `npm test`. Prefer colocated `*.test.ts` or `*.test.tsx` files near the module under test, especially for feature `lib/` modules that hold domain, routing, filtering, media, or canvas-session behavior. For changes, run `npm test`, `npm run lint`, `npm run type-check`, and, for user-facing or CMS changes, `npm run build`.

## Commit & Pull Request Guidelines

Recent commits use short, imperative, lowercase messages such as `fix build error` and `complete navbar drawer`. Keep commits focused on one user-visible change or bug fix. Pull requests should include a concise summary, verification commands, linked issue or task when available, and screenshots or screen recordings for visual changes. Call out Sanity schema, environment variable, or deployment changes explicitly.

## Security & Configuration Tips

Store secrets only in `.env.local` or the deployment platform. Required Sanity and deployment variables are documented in `README.md` and `docs/environment.md`; never commit tokens or generated local caches.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `pinpointpinpoint/style-up-studio` using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default canonical label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This repo uses a single-context domain-doc layout. See `docs/agents/domain.md`.
