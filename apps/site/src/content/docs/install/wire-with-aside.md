---
title: "Wire up: with-aside layout"
description: The exact content-schema field and component override needed to use @dagilleland/layout-with-aside in your own project, once it's installed.
---

This page assumes `@dagilleland/layout-with-aside` is already installed — via [npm](/starlight-layouts/install/npm/), [pnpm](/starlight-layouts/install/pnpm/), or [a manual copy](/starlight-layouts/install/manual-copy/). What's below is identical regardless of which method you used.

**Prerequisites:** an Astro project using [Starlight](https://starlight.astro.build), with [Tailwind v4 set up per Starlight's own guide](https://starlight.astro.build/guides/css-and-tailwind/) — `AsideCallout` is styled entirely with Tailwind utility classes, referencing Starlight's own `--sl-color-*` custom properties so it automatically matches your site's theme.

Unlike the other three layouts in this family, this one doesn't remove anything from Starlight's default page — it *adds* a callout panel to the right-hand column, alongside the normal table of contents rather than in place of it. That means it only needs one override, not two.

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
          // Not `layout` — see the note on layout-full-width's wire-up page.
          pageLayout: z.enum(['with-aside']).optional(),
        }),
    }),
  }),
};
```

Already have a `pageLayout` field from wiring up another layout package? Add `'with-aside'` to that same `z.enum([...])` array instead of creating a second field.

## 2. Override `PageSidebar`

Import `PageSidebarExtra` straight from the installed package and dispatch to it:

```astro title="src/components/overrides/PageSidebar.astro"
---
import Default from '@astrojs/starlight/components/PageSidebar.astro';
import PageSidebarExtra from '@dagilleland/layout-with-aside/PageSidebarExtra.astro';

const { entry } = Astro.locals.starlightRoute;
const withAside = entry.data.pageLayout === 'with-aside';
---

<Default />
{withAside && <PageSidebarExtra />}
```

## 3. Register the override

```js title="astro.config.mjs"
starlight({
  components: {
    PageSidebar: './src/components/overrides/PageSidebar.astro',
  },
});
```

## 4. Use it on a page

```md title="src/content/docs/some-page.md"
---
title: A page with an aside
pageLayout: with-aside
---
```

Pages without `pageLayout: with-aside` render byte-for-byte the same right column Starlight would have produced on its own — this override never branches away from `<Default />`, only adds to it.

See [Building: layout with aside](/starlight-layouts/tutorial/aside-layout/) for why this is a good example of an *additive* override, as opposed to the *replacing* overrides the other three layouts in this family use.
