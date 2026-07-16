# `@dagilleland/starlight-plugin-layouts`

Part of [Starlight Layouts](https://gilleland.ca/starlight-layouts/) — a tutorial site for overriding Starlight components to build custom page layouts. This package bundles all four layouts (`@dagilleland/layout-full-width`, `layout-minimal`, `layout-with-aside`, `layout-dashboard`) as a single Starlight plugin, so installing it wires up all four dispatcher overrides automatically — no override files to create by hand.

## What's here

- `layouts.meta.ts` / `layouts.config.ts` — the same registry pattern as the tutorial site's own `apps/site/src/layouts.config.ts`, importing all four layout packages by their published names.
- `overrides/{PageFrame,TwoColumnContent,PageSidebar,ContentPanel}.astro` — the four dispatcher components, identical to the tutorial site's own `apps/site/src/components/overrides/*.astro`.
- `tailwind.css` — aggregates all four layout packages' own `tailwind.css` files into one `@import`.
- `index.ts` — the plugin itself: a `starlightLayouts()` factory returning a `StarlightPlugin` that registers the four overrides via `updateConfig`, plus a re-exported `layoutIds`/`LayoutId` for building your own content-schema field from the same source of truth.

Why one plugin instead of four independent ones: `full-width`, `minimal`, and `dashboard` all share the `TwoColumnContent`/`ContentPanel` slots via a `wide` trait. Starlight applies each plugin's `updateConfig({ components: {...} })` call as a whole-object replacement, not a per-key merge — so two independent plugins both touching the same slot would have the second one silently clobber the first's registration. One plugin owning the whole family avoids that collision entirely. See [Turning it into a Starlight plugin](https://gilleland.ca/starlight-layouts/tutorial/starlight-plugin/) for the full reasoning.

## Using this in a pnpm workspace monorepo

This package isn't used by the tutorial site itself — `apps/site` keeps its own hand-written dispatcher files, since that's what the tutorial is teaching. This package exists as the *packaged* version of that same pattern, for someone who wants the four layouts working with the least possible setup rather than following along with how the override mechanism works.

## Using this standalone, in your own project

**Prerequisites:** an Astro project using [Starlight](https://starlight.astro.build), with [Tailwind v4 set up per Starlight's own guide](https://starlight.astro.build/guides/css-and-tailwind/) — `layout-with-aside` and `layout-dashboard`'s components are styled with Tailwind utility classes.

### 1. Install the package

```sh
npm install @dagilleland/starlight-plugin-layouts
```

Works the same with `pnpm add`, `yarn add`, or `bun add`. This installs the plugin and all four layout packages together — you don't need to also `npm install` each one separately.

### 2. Register the plugin

```js title="astro.config.mjs"
import starlight from '@astrojs/starlight';
import starlightLayouts from '@dagilleland/starlight-plugin-layouts';

starlight({
  plugins: [starlightLayouts()],
});
```

This registers `PageFrame`, `TwoColumnContent`, `PageSidebar`, and `ContentPanel` for you. Don't also set any of those four directly in your own `components:` config, or combine this with another plugin that touches the same slots — whichever runs last wins, silently.

### 3. Add a frontmatter field

A Starlight plugin can't extend the content-collection schema — this step stays manual, but `layoutIds` keeps it to one line instead of retyping four layout names:

```ts title="src/content.config.ts"
import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { layoutIds } from '@dagilleland/starlight-plugin-layouts/meta';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: () =>
        z.object({
          pageLayout: z.enum(layoutIds).optional(),
        }),
    }),
  }),
};
```

### 4. Import the bundled Tailwind styles

Also stays manual, for the same reason: Tailwind v4 only scans `@source` directives that live in the same CSS module graph as wherever `tailwindcss` itself is imported, and a plugin's `customCss` entries are a separate, disconnected graph — registering this automatically doesn't work (confirmed by building it both ways and diffing the compiled CSS). One `@import` covers all four layouts:

```css title="src/styles/global.css"
@import '@dagilleland/starlight-plugin-layouts/tailwind.css';
```

### 5. Use a layout on a page

```md title="src/content/docs/some-page.md"
---
title: A wide page
pageLayout: full-width
---
```

Any of the four layout IDs work here: `full-width`, `minimal`, `with-aside`, `dashboard`. Pages without `pageLayout` set fall straight through to Starlight's own default rendering, same as if you'd wired up each layout package by hand.

## Want just one or two layouts instead of all four?

This plugin is all-or-nothing by design — it's meant to replace the full manual wiring, not a subset of it. For a single layout, or to see the override code you're actually installing, use that layout's own package directly and follow its README, or the corresponding [wire-up page](https://gilleland.ca/starlight-layouts/install/wire-full-width/) on the tutorial site.
