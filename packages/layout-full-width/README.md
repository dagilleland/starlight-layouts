# `@dagilleland/layout-full-width`

Part of [Starlight Layouts](https://gilleland.ca/starlight-layouts/) — a tutorial site for overriding Starlight components to build custom page layouts. This is the simplest of the four layouts it builds: it drops a page's right-hand table of contents and lets the main content pane use the full available width.

## Compatibility

Works with **Astro 6.4.5+ or 7.x**, and **Starlight 0.40.0–0.41.x** — enforced by this package's own `peerDependencies`, and confirmed by actually building and rendering a test project against both ends of that range (Astro 6.4.8/Starlight 0.40.0, and Astro 7.0.9/Starlight 0.41.3), not just inferred from the declared versions.

## What's here

- `layout.meta.ts` — `{ id: 'full-width', wide: true }`. That's the whole package.
- `index.ts` — re-exports the same object as `fullWidthLayout`.

There's no `.astro` file, because there's no custom markup this layout needs. `wide: true` *is* the entire behavior — and that behavior only exists in whatever code reads the flag, which is why this package alone doesn't do anything on its own. See "Using this standalone" below.

## Using this in a pnpm workspace monorepo

This is the pattern the package was actually built for: a central app composes several layout packages like this one through a small registry, and its own Starlight overrides check `layout?.wide` rather than hardcoding a layout name. See [Composing layout packages](https://gilleland.ca/starlight-layouts/tutorial/composing-layout-packages/) for the full mechanism, and [Building: full-width layout](https://gilleland.ca/starlight-layouts/tutorial/full-width-layout/) for why this specific layout needs *two* Starlight overrides working together, not one.

## Using this standalone, in your own project

If you're not running a monorepo, or you'd rather adapt this layout than depend on a package for it, here's the whole thing, copy-paste ready. `wide: true` needs two Starlight component overrides to actually do anything: `TwoColumnContent` (drops the right column) and `ContentPanel` (removes Starlight's content-width cap). Both are necessary — dropping the column alone leaves the reclaimed width sitting empty, since `ContentPanel` caps content width independently of how wide its parent is.

**Prerequisites:** an Astro project using [Starlight](https://starlight.astro.build), with [Tailwind v4 set up per Starlight's own guide](https://starlight.astro.build/guides/css-and-tailwind/) (only needed if you also want the other three layouts in this family, which use Tailwind-classed components — this one doesn't).

### 1. Install the package

```sh
npm install @dagilleland/layout-full-width
```

Works the same with `pnpm add`, `yarn add`, or `bun add` — this is a normal published package, not tied to any particular package manager.

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
          // Not `layout` — on `.mdx` files that key is reserved by
          // @astrojs/mdx as an import path for a layout component, and a
          // plain string there fails the build with a confusing
          // "failed to resolve import" error instead of a schema error.
          pageLayout: z.enum(['full-width']).optional(),
        }),
    }),
  }),
};
```

### 3. Override `TwoColumnContent`

```astro title="src/components/overrides/TwoColumnContent.astro"
---
import Default from '@astrojs/starlight/components/TwoColumnContent.astro';

const { entry } = Astro.locals.starlightRoute;
const wide = entry.data.pageLayout === 'full-width';
---

{wide ? (
  <div class="main-pane main-pane--full">
    <slot />
  </div>
) : (
  <Default>
    <slot name="right-sidebar" slot="right-sidebar" />
    <slot />
  </Default>
)}

<style>
  @layer starlight.core {
    .main-pane--full {
      isolation: isolate;
      width: 100%;
    }
  }
</style>
```

### 4. Override `ContentPanel`

```astro title="src/components/overrides/ContentPanel.astro"
---
import Default from '@astrojs/starlight/components/ContentPanel.astro';

const { entry } = Astro.locals.starlightRoute;
const wide = entry.data.pageLayout === 'full-width';
---

{wide ? (
  <div class="content-panel content-panel--uncapped">
    <div class="uncapped-container">
      <slot />
    </div>
  </div>
) : (
  <Default><slot /></Default>
)}

<style>
  @layer starlight.core {
    .content-panel--uncapped {
      padding: 1.5rem var(--sl-content-pad-x);
    }
    .uncapped-container {
      max-width: none;
    }
  }
</style>
```

### 5. Register both overrides

```js title="astro.config.mjs"
starlight({
  components: {
    TwoColumnContent: './src/components/overrides/TwoColumnContent.astro',
    ContentPanel: './src/components/overrides/ContentPanel.astro',
  },
});
```

### 6. Use it on a page

```md
---
title: A wide page
pageLayout: full-width
---
```

Every page without `pageLayout: full-width` falls straight through to `<Default>` in both overrides — nothing here changes how the rest of your site renders.
