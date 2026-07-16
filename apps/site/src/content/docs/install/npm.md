---
title: Install layouts via npm
description: Install one or more layout packages from the public npm registry — works with npm, pnpm, yarn, or bun, no monorepo or git dependency required.
---

Each layout is published as its own package under the `@dagilleland` scope. This is the simplest way to use one: a normal registry install, with any package manager.

## tl;dr

```sh
npm install @dagilleland/layout-full-width @dagilleland/layout-minimal @dagilleland/layout-with-aside @dagilleland/layout-dashboard
```

Only want a subset? Drop whichever package names you don't need — none of the four depend on each other, so any combination works.

## Installing one layout

```sh
npm install @dagilleland/layout-dashboard
```

Or `pnpm add`, `yarn add`, `bun add` — same package name, same result, whichever you already use. Unlike [installing via pnpm's git-subdirectory support](/starlight-layouts/install/pnpm/), this doesn't require pnpm specifically.

The four package names:

| Layout | Package |
| --- | --- |
| Full-width | `@dagilleland/layout-full-width` |
| Minimal | `@dagilleland/layout-minimal` |
| With aside | `@dagilleland/layout-with-aside` |
| Dashboard | `@dagilleland/layout-dashboard` |

## What you get, and what you still have to do

Every package installs the same way: raw `.astro`/`.ts` source, no build step. What's still manual is different per layout — here's exactly what each one needs, not a generic "some wiring required":

| Layout | You still have to add | Full steps |
| --- | --- | --- |
| `layout-dashboard` widgets | Nothing — see [below](#the-one-case-with-zero-wiring) | — |
| `layout-full-width` | `TwoColumnContent` override, `ContentPanel` override, 1 content-schema field | [Wire up: full-width →](/starlight-layouts/install/wire-full-width/) |
| `layout-minimal` | `PageFrame` override, `TwoColumnContent` override, `ContentPanel` override, 1 content-schema field | [Wire up: minimal →](/starlight-layouts/install/wire-minimal/) |
| `layout-with-aside` | `PageSidebar` override, 1 content-schema field | [Wire up: with-aside →](/starlight-layouts/install/wire-with-aside/) |
| `layout-dashboard`'s full-width treatment | Same as `layout-full-width`, above | [Wire up: dashboard →](/starlight-layouts/install/wire-dashboard/) |

Each linked page has the exact code for every step, with a title on every code block showing exactly which file it goes in — not a description of what to write.

### The one case with zero wiring

`layout-dashboard`'s `DashboardGrid` and `Widget` aren't Starlight overrides — they're ordinary components, usable the moment they're installed:

```sh
npm install @dagilleland/layout-dashboard
```

```mdx title="src/content/docs/some-page.mdx"
import { DashboardGrid, Widget } from '@dagilleland/layout-dashboard';

<DashboardGrid>
  <Widget title="Active users" value="2,481" trend="up" delta="4.2% vs last week" />
  <Widget title="Error rate" value="0.8%" trend="down" delta="0.3pt vs last week" />
</DashboardGrid>
```

Drop that into any `.mdx` page and it renders — no frontmatter field, no override, no `astro.config.mjs` change. That's genuinely the whole thing for this one case; every other row in the table above needs its linked wire-up page.

## When you'd want a different method instead

- **You want the unreleased, in-development version** rather than the latest published release — see [Install layouts via pnpm](/starlight-layouts/install/pnpm/), which installs straight from this repo's `main` branch.
- **You want to modify a layout's source directly**, not just configure it — see [Manually copying layouts](/starlight-layouts/install/manual-copy/).

For everyone else, this page is the one to use.
