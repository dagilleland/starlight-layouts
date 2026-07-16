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

Same as any install method for these packages: you get the raw `.astro`/`.ts` source (no build step), but wiring the layout into your Starlight site — an override component, a content-schema field, registering it in `astro.config.mjs` — is still a manual step specific to each layout. Each package's README covers exactly that, and it's included in what you just installed:

```sh
# after installing, read it locally:
cat node_modules/@dagilleland/layout-dashboard/README.md
```

Or read it on the [npm package page](https://www.npmjs.com/package/@dagilleland/layout-dashboard) or [on GitHub](https://github.com/dagilleland/starlight-layouts/tree/main/packages/layout-dashboard#readme) before installing.

## When you'd want a different method instead

- **You want the unreleased, in-development version** rather than the latest published release — see [Install layouts via pnpm](/starlight-layouts/install/pnpm/), which installs straight from this repo's `main` branch.
- **You want to modify a layout's source directly**, not just configure it — see [Manually copying layouts](/starlight-layouts/install/manual-copy/).

For everyone else, this page is the one to use.
