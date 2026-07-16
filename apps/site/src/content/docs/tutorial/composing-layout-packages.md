---
title: Composing layout packages
description: Why this project moved each layout into its own pnpm workspace package, and how the app composes them without Starlight ever knowing packages exist.
---

Every layout built so far lives partly in `apps/site` (the Starlight app)
and partly in its own package under `packages/`. This page covers why that
split exists and how the two sides talk to each other — the last piece
needed to understand this project as a whole, and the thing to copy if you
want to add a fifth layout of your own.

## The constraint that shapes everything here

Starlight's [`components`](https://starlight.astro.build/reference/configuration/#components)
option takes exactly **one** file path per slot. If `layout-minimal` and
`layout-dashboard` were both independent packages that wanted to register
their own `TwoColumnContent` override, only the last one registered would
win — Starlight has no concept of "compose these three partial overrides
together." Something has to own each slot and decide, per page, which
layout's behavior applies.

That something is the four dispatcher files under
`apps/site/src/components/overrides/` — the only files actually registered
with Starlight. Every layout package earlier in this tutorial exports
either a plain trait (`wide: true`) or a component reference
(`PageFrame`, `PageSidebarExtra`); none of them touch `astro.config.mjs`
or know Starlight's `components` option exists at all.

## The registry

`apps/site/src/layouts.config.ts` is what turns four independent packages
into the one thing each dispatcher needs — a lookup by `pageLayout` value:

```ts title="apps/site/src/layouts.config.ts"
import { fullWidthLayout } from '@dagilleland/layout-full-width';
import { minimalLayout } from '@dagilleland/layout-minimal';
import { withAsideLayout } from '@dagilleland/layout-with-aside';
import { dashboardLayout } from '@dagilleland/layout-dashboard';
import type { LayoutId } from './layouts.meta';

const layouts = [fullWidthLayout, minimalLayout, withAsideLayout, dashboardLayout];

export function getLayout(id: LayoutId | undefined) {
  return layouts.find((layout) => layout.id === id);
}
```

Every dispatcher imports `getLayout` and either checks a trait
(`layout?.wide`, in `TwoColumnContent` and `ContentPanel`) or renders a
component reference the active layout provided (`layout?.PageFrame`,
`layout?.PageSidebarExtra`) — covered in full in the
[full-width](/starlight-layouts/tutorial/full-width-layout/), [minimal](/starlight-layouts/tutorial/minimal-layout/),
and [with-aside](/starlight-layouts/tutorial/aside-layout/) tutorial pages.

## Why `layouts.meta.ts` is a separate file

`apps/site/src/content.config.ts` needs the *set* of valid `pageLayout`
values to build its Zod enum — but `content.config.ts` runs in a content-
layer context that shouldn't have to compile `.astro` files, and
`layouts.config.ts` above imports plenty of those (`PageFrame`,
`PageSidebarExtra`). So each package splits its export in two:

```ts title="packages/layout-minimal/layout.meta.ts — zero imports"
export const minimalMeta = {
  id: 'minimal',
  wide: true,
} as const;
```

```ts title="packages/layout-minimal/index.ts — imports the .astro component"
import PageFrame from './PageFrame.astro';
import { minimalMeta } from './layout.meta';

export const minimalLayout = { ...minimalMeta, PageFrame };
```

`apps/site/src/layouts.meta.ts` imports only the `meta` half from all four
packages, builds a literal-typed tuple of IDs, and that's what
`content.config.ts` actually imports:

```ts title="apps/site/src/layouts.meta.ts"
import { fullWidthMeta } from '@dagilleland/layout-full-width/meta';
import { minimalMeta } from '@dagilleland/layout-minimal/meta';
import { withAsideMeta } from '@dagilleland/layout-with-aside/meta';
import { dashboardMeta } from '@dagilleland/layout-dashboard/meta';

export const layoutIds = [
  fullWidthMeta.id,
  minimalMeta.id,
  withAsideMeta.id,
  dashboardMeta.id,
] as const;

export type LayoutId = (typeof layoutIds)[number];
```

Two files, two audiences: `layouts.meta.ts` for the content schema,
`layouts.config.ts` for the dispatchers. Both stay in sync because they're
built from the same four packages — add a layout to one list and the other
picks it up the next time someone reads through both.

## What a package actually is

Every `packages/layout-*` directory is a plain pnpm workspace package —
raw `.astro`/`.ts` source, no build step, the same way
`@astrojs/starlight-tailwind` (used earlier for [Tailwind](/starlight-layouts/tutorial/aside-layout/))
ships. Its `package.json` exports both a barrel and raw file access:

```json title="packages/layout-dashboard/package.json"
{
  "name": "@dagilleland/layout-dashboard",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./index.ts",
    "./meta": "./layout.meta.ts",
    "./*": "./*"
  },
  "peerDependencies": {
    "astro": "^6.4.5 || ^7.0.2",
    "@astrojs/starlight": ">=0.40.0 <0.42.0"
  }
}
```

`astro` is a `peerDependency`, not a regular `dependency` — pnpm's
workspace deduplication then guarantees the app and every layout package
share exactly one Astro instance. Two copies would desync
`Astro.locals`/content-collection context in ways that are confusing to
debug, since Astro's own runtime state assumes there's only one of it.

`apps/site/package.json` depends on all four with `workspace:*`, which
pnpm resolves to the local package regardless of any published version:

```json title="apps/site/package.json (excerpt)"
{
  "dependencies": {
    "@dagilleland/layout-full-width": "workspace:*",
    "@dagilleland/layout-minimal": "workspace:*",
    "@dagilleland/layout-with-aside": "workspace:*",
    "@dagilleland/layout-dashboard": "workspace:*"
  }
}
```

## Tailwind classes that travel with the package

Every custom component in these packages — `AsideCallout`, `Widget`,
`DashboardGrid`, `PageFrame` — is styled with Tailwind utility classes.
That created a real bug the first time this project moved from a single
app to a monorepo: Tailwind's automatic content scanning only walks the
consuming app's own directory tree, so classes used only inside
`packages/*` (and never coincidentally quoted as literal text somewhere in
`apps/site`) silently generated no CSS at all — no error, just missing
styles.

The fix has to work for two audiences at once: this monorepo today, and
someone who `npm install`s one of these packages into an unrelated project
tomorrow. A path like `@source '../../../../packages/**/*.astro';` written
into `apps/site`'s own CSS only solves the first case — it's relative to
*this* repo's layout, and does nothing once a package is copied into
someone else's `node_modules`. Tailwind also excludes `node_modules` from
automatic scanning by default, so an external consumer would hit the exact
same silent failure, with no monorepo-specific line to blame it on.

Instead, each package ships its own tiny CSS file that registers *itself*:

```css title="packages/layout-dashboard/tailwind.css"
@source './**/*.astro';
```

`@source` resolves relative to the file it's written in, not the file that
imports it — so this line means "scan this package's own `.astro` files"
no matter where the package physically ends up. A consumer adds one import
to their own Tailwind CSS entry:

```css title="apps/site/src/styles/global.css (excerpt)"
@import '@dagilleland/layout-dashboard/tailwind.css';
```

and the package's classes get scanned and compiled by the **consumer's
own** Tailwind build — using the consumer's own theme, and landing in
whatever cascade-layer position the consumer already established (this
project's `@layer base, starlight, theme, components, utilities;`, or
someone else's entirely). Shipping pre-built CSS from the package instead
would bake in whichever theme and layer position happened to be active
when the package itself was built — precisely the kind of conflict this
approach avoids.

That's also why every component in these packages reads colors from
Starlight's own `--sl-color-*` custom properties (`bg-[var(--sl-color-bg-sidebar)]`)
instead of hardcoding a color or defining a `@theme` of its own: whether an
end user themes their site by overriding `--sl-color-*` directly, or by
setting `--color-accent-*`/`--color-gray-*` in their own `@theme` block per
[Starlight's Theming guide](https://starlight.astro.build/guides/css-and-tailwind/#theming)
(which `@astrojs/starlight-tailwind` translates into `--sl-color-*` at
build time either way), these components pick up the change automatically.
Nothing in `packages/layout-*` ever introduces a new named layer or a new
color token of its own to collide with.

## Adding a fifth layout

Say you wanted a `layout: split` that shows two columns of content
side by side. The work is entirely additive:

1. `packages/layout-split/` — `layout.meta.ts` (`{ id: 'split' }`, plus
   whatever traits it needs), `index.ts`, any custom component(s), and a
   `tailwind.css` if it uses Tailwind classes.
2. Add it to `apps/site/package.json`'s dependencies.
3. Add one import + one array entry to `apps/site/src/layouts.meta.ts`.
4. Add the matching import + array entry to `apps/site/src/layouts.config.ts`.
5. Add one `@import` line to `apps/site/src/styles/global.css`.
6. Write a demo page with `pageLayout: split` in its frontmatter.

Notice what's missing: no edits to any of the four dispatcher files under
`apps/site/src/components/overrides/`. That's the actual payoff of this
whole structure — the files Starlight's `components` option points at
don't grow with each new layout, only the registry does.
