# `@dagilleland/layout-minimal`

Part of [Starlight Layouts](https://gilleland.ca/starlight-layouts/) — a tutorial site for overriding Starlight components to build custom page layouts. This layout strips a page down to just the header and content: no left navigation sidebar, no right-hand table of contents. Useful for standalone pages — a print view, an embed, a one-off landing section — that shouldn't feel like part of the docs tree.

## Compatibility

Works with **Astro 6.4.5+ or 7.x**, and **Starlight 0.40.0–0.41.x** — enforced by this package's own `peerDependencies`, and confirmed by actually building and rendering a test project against both ends of that range (Astro 6.4.8/Starlight 0.40.0, and Astro 7.0.9/Starlight 0.41.3), not just inferred from the declared versions.

## What's here

- `layout.meta.ts` — `{ id: 'minimal', wide: true }`.
- `PageFrame.astro` — the replacement for Starlight's own `PageFrame`: renders the header slot as usual, but never renders a `sidebar` slot at all. Starlight still computes the sidebar navigation for the page; nothing here asks for it.
- `index.ts` — combines the two as `minimalLayout`.

`PageFrame.astro` does nothing by itself — it has to be rendered *in place of* Starlight's default `PageFrame` by an override that decides when to use it. See "Using this standalone" below for that override, or [Composing layout packages](https://gilleland.ca/starlight-layouts/tutorial/composing-layout-packages/) for how a registry of several such packages picks between them.

## Using this in a pnpm workspace monorepo

See [Building: minimal layout](https://gilleland.ca/starlight-layouts/tutorial/minimal-layout/) for the full walkthrough, including a CSS-variable gotcha this package's `<style>` block works around (Starlight sets `data-has-sidebar` on `<html>` based on whether the sidebar *config* has entries, regardless of whether a `PageFrame` override actually renders one — left alone, that would leave a sidebar-sized gap on the left with nothing in it).

## Using this standalone, in your own project

**Prerequisites:** an Astro project using [Starlight](https://starlight.astro.build). This package has no Tailwind classes of its own, so Tailwind isn't required just for this layout.

`minimal` needs two things wired up: a `PageFrame` override to render (or not render) the component above, and the same `wide` treatment as `layout-full-width` (the sibling package in this family) to also drop the right-hand table of contents.

### 1. Install the package

```sh
npm install @dagilleland/layout-minimal
```

Works the same with `pnpm add`, `yarn add`, or `bun add`.

### 2. Add a frontmatter field

```ts title="src/content.config.ts"
import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: () =>
        z.object({
          // Not `layout` — see the note in layout-full-width's README.
          pageLayout: z.enum(['minimal']).optional(),
        }),
    }),
  }),
};
```

### 3. Override `PageFrame`

Import `PageFrame.astro` straight from the installed package (its `package.json` exports every file, not just `index.ts`) and dispatch to it:

```astro title="src/components/overrides/PageFrame.astro"
---
import Default from '@astrojs/starlight/components/PageFrame.astro';
import MinimalPageFrame from '@dagilleland/layout-minimal/PageFrame.astro';

const { entry } = Astro.locals.starlightRoute;
const minimal = entry.data.pageLayout === 'minimal';
---

{minimal ? (
  <MinimalPageFrame>
    <slot name="header" slot="header" />
    <slot />
  </MinimalPageFrame>
) : (
  <Default>
    <slot name="header" slot="header" />
    <slot name="sidebar" slot="sidebar" />
    <slot />
  </Default>
)}
```

### 4. Override `TwoColumnContent` and `ContentPanel`

Same two overrides as [`layout-full-width`](../layout-full-width/README.md), checking `pageLayout === 'minimal'` (or `'full-width'`, if you're using both — see that package's README for the full code). Both are necessary for the same reason: without them, the space freed up by removing the sidebars just sits empty.

### 5. Register the overrides

```js title="astro.config.mjs"
starlight({
  components: {
    PageFrame: './src/components/overrides/PageFrame.astro',
    TwoColumnContent: './src/components/overrides/TwoColumnContent.astro',
    ContentPanel: './src/components/overrides/ContentPanel.astro',
  },
});
```

### 6. Use it on a page

```md
---
title: A standalone page
pageLayout: minimal
---
```
