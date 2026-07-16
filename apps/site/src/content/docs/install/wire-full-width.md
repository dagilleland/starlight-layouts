---
title: "Wire up: full-width layout"
description: The exact content-schema field and component overrides needed to use @dagilleland/layout-full-width in your own project, once it's installed.
---

This page assumes `@dagilleland/layout-full-width` is already installed — via [npm](/starlight-layouts/install/npm/), [pnpm](/starlight-layouts/install/pnpm/), or [a manual copy](/starlight-layouts/install/manual-copy/). What's below is identical regardless of which method you used.

**Prerequisites:** an Astro project using [Starlight](https://starlight.astro.build). Tailwind isn't required for this specific layout — it has no bespoke component, so there's no Tailwind-classed markup to render. (You'd still need it if you're also wiring up [minimal](/starlight-layouts/install/wire-minimal/), [with-aside](/starlight-layouts/install/wire-with-aside/), or [dashboard](/starlight-layouts/install/wire-dashboard/) alongside this one.)

`wide: true` — the one thing this package's `layout.meta.ts` sets — needs two Starlight component overrides to actually do anything: `TwoColumnContent` drops the right-hand table of contents, and `ContentPanel` removes Starlight's content-width cap so the reclaimed space is actually usable. Both are necessary — dropping the column alone just leaves the reclaimed width empty, since `ContentPanel` caps content width independently of how wide its parent is.

## 1. Add a frontmatter field

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

Already have a `pageLayout` field from wiring up another layout package? Add `'full-width'` to that same `z.enum([...])` array instead of creating a second field — one `pageLayout` value covers every layout you install.

## 2. Override `TwoColumnContent`

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

## 3. Override `ContentPanel`

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

## 4. Register both overrides

```js title="astro.config.mjs"
starlight({
  components: {
    TwoColumnContent: './src/components/overrides/TwoColumnContent.astro',
    ContentPanel: './src/components/overrides/ContentPanel.astro',
  },
});
```

Already registering overrides for another layout? Add these two lines into your existing `components: { ... }` object rather than a second `starlight()` call.

## 5. Use it on a page

```md title="src/content/docs/some-page.md"
---
title: A wide page
pageLayout: full-width
---
```

Every page without `pageLayout: full-width` falls straight through to `<Default>` in both overrides — nothing here changes how the rest of your site renders.

See [Building: full-width layout](/starlight-layouts/tutorial/full-width-layout/) for why this override works the way it does.
