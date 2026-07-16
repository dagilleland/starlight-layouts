# Starlight Layouts

A tutorial and live demo site for overriding Starlight components to build
custom page layouts, while keeping Starlight's own defaults available on
every page that doesn't opt in.

Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build) + [Tailwind CSS](https://tailwindcss.com), as a pnpm workspace monorepo: the Starlight app is one package, and each custom layout is its own.

## What's here

- **`/tutorial/*`** — walks through Starlight's component override system:
  which components are overridable, the `Default`-import pattern for
  wrapping (rather than replacing) a default component, a custom
  `pageLayout` frontmatter field so a single override can branch between
  default and custom rendering per page, and — in the last page — how the
  four layouts became independent packages composed by the app.
- **`/demos/*`** — a real route for each layout built in the tutorial, so
  you can see and compare them directly: `default`, `splash` (Starlight's
  own built-in template), `full-width`, `minimal`, `with-aside`, and
  `dashboard`.
- **`/guides/*`** — content-level guidance, as opposed to the tutorial's
  component-override mechanics. Currently one guide, on filling a
  `dashboard`-layout page with widgets.

## Project structure

```
.
├── apps/
│   └── site/                        # the Starlight app
│       ├── src/
│       │   ├── components/overrides/  # the 4 dispatchers Starlight actually registers
│       │   │   ├── PageFrame.astro
│       │   │   ├── TwoColumnContent.astro
│       │   │   ├── PageSidebar.astro
│       │   │   └── ContentPanel.astro
│       │   ├── layouts.meta.ts      # layout IDs only, no .astro imports — feeds content.config.ts
│       │   ├── layouts.config.ts    # full layout descriptors incl. components — feeds the dispatchers
│       │   ├── content.config.ts    # extends the docs schema with a `pageLayout` field
│       │   ├── content/docs/
│       │   │   ├── tutorial/
│       │   │   ├── guides/
│       │   │   ├── demos/
│       │   │   └── index.mdx
│       │   └── styles/global.css    # Tailwind + Starlight cascade layer setup
│       ├── astro.config.mjs         # registers the dispatchers, sidebar nav, Tailwind's Vite plugin
│       └── package.json             # depends on the 4 layout packages via workspace:*
├── packages/
│   ├── layout-full-width/           # metadata only — the simplest layout
│   ├── layout-minimal/              # owns PageFrame.astro
│   ├── layout-with-aside/           # owns PageSidebarExtra.astro + AsideCallout.astro
│   └── layout-dashboard/            # owns DashboardGrid.astro + Widget.astro
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── package.json                     # thin workspace root; proxies scripts to apps/site
```

Each `packages/layout-*` is a plain pnpm workspace package — raw
`.astro`/`.ts` source, no build step, consumed via `workspace:*` the same
way `apps/site` already consumes `@astrojs/starlight-tailwind`. Run the
site locally and visit `/tutorial/composing-layout-packages/` for the full
walkthrough, including why each package splits its export into a
zero-import `layout.meta.ts` and a component-bearing `index.ts`.

## Commands

Run from the repo root — they proxy to `apps/site` via pnpm's `--filter`:

| Command                    | Action                                           |
| :-------------------------- | :----------------------------------------------- |
| `pnpm install`              | Installs dependencies for every package in the workspace |
| `pnpm run dev`               | Starts local dev server (`localhost:4321` by default, or the next free port if that one's taken) |
| `pnpm run build`            | Build the site to `apps/site/dist/`              |
| `pnpm run preview`          | Preview the build locally, before deploying      |
| `pnpm run astro ...`        | Run CLI commands like `astro add`, `astro check` against the site |

To run a command against a single package directly, use
`pnpm --filter <package-name> <command>` — e.g.
`pnpm --filter @dagilleland/layout-dashboard ...`.

## Deployment

Deploys to GitHub Pages via `.github/workflows/deploy.yml` on every push to
`main`. Two things about this repo's setup are worth knowing if you're
adapting it:

- **This repo doesn't own its custom domain.** `dagilleland.github.io` (a
  separate repo) holds the `CNAME` for `gilleland.ca`; this project repo
  rides along underneath it at `gilleland.ca/starlight-layouts/` without a
  `CNAME` of its own. That's why `astro.config.mjs` sets `site` to the bare
  origin (`https://gilleland.ca/`) *and* keeps `base: '/starlight-layouts'`
  — Astro's own guide treats "custom domain" and "subpath" as mutually
  exclusive cases, but an account where a different repo already owns the
  domain needs both at once.
- **Internal links are absolute, with the base baked in by hand**
  (`/starlight-layouts/tutorial/...`), not relative. Starlight's own
  sidebar/pagination links get `base` applied automatically from their
  `slug`; anything hand-typed — Markdown links, the homepage hero's
  `actions[].link` — doesn't, and needs the prefix written out.

## Learn more

[Starlight's own docs on overriding components](https://starlight.astro.build/guides/overriding-components/)
cover the same mechanism this site's tutorial builds on.
