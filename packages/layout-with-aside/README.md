# `@dagilleland/layout-with-aside`

Part of [Starlight Layouts](https://gilleland.ca/starlight-layouts/) — a tutorial site for overriding Starlight components to build custom page layouts. Unlike the other three layouts in this family, this one doesn't remove anything from Starlight's default page — it *adds* a callout panel to the right-hand column, alongside the normal table of contents rather than in place of it.

## What's here

- `layout.meta.ts` — `{ id: 'with-aside' }`. No `wide` flag: this layout keeps Starlight's default two-column width, it only adds a panel to the existing right column.
- `AsideCallout.astro` — a plain, Tailwind-styled callout box. Not a Starlight override itself — just an ordinary component. Props: `title: string` (heading text), default slot (body content).
- `PageSidebarExtra.astro` — wraps `AsideCallout` with the specific markup and sizing this layout needs (see "The width fix" below), imports nothing beyond `AsideCallout`.
- `index.ts` — combines `layout.meta.ts` and `PageSidebarExtra.astro` as `withAsideLayout`, and separately re-exports `AsideCallout` in case you want to reuse the callout style elsewhere (in page content, for instance).

Neither `.astro` file renders anything by itself — they need a `PageSidebar` override that decides *whether* to render `PageSidebarExtra`, on top of Starlight's own default output. See "Using this standalone" below.

### The width fix

`PageSidebarExtra`'s `<style>` block sets an explicit `width` rather than relying on `width: 100%`. That's not a stylistic choice — it works around a real bug: the ancestor Starlight renders sidebar content into (`.right-sidebar`) is `position: fixed; width: 100%` with no ancestor establishing a containing block for fixed-position elements, so that `100%` resolves against the *viewport*, not the visible sidebar column. Starlight's own table-of-contents content is immune because it sets an explicit calculated width instead of a percentage; this component does the same, or its text runs on for a very long line before wrapping — invisible until it scrolls off past the edge of the page.

## Using this in a pnpm workspace monorepo

See [Building: layout with aside](https://gilleland.ca/starlight-layouts/tutorial/aside-layout/) for the full walkthrough, including why this is a good example of an *additive* override (always renders Starlight's default, then layers on top) as opposed to the *replacing* overrides the other three layouts in this family use.

## Using this standalone, in your own project

**Prerequisites:** an Astro project using [Starlight](https://starlight.astro.build), with [Tailwind v4 set up per Starlight's own guide](https://starlight.astro.build/guides/css-and-tailwind/) — `AsideCallout` is styled entirely with Tailwind utility classes, referencing Starlight's own `--sl-color-*` custom properties so it automatically matches your site's theme.

### 1. Install the package

```sh
npm install @dagilleland/layout-with-aside
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
          pageLayout: z.enum(['with-aside']).optional(),
        }),
    }),
  }),
};
```

### 3. Override `PageSidebar`

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

### 4. Register the override

```js title="astro.config.mjs"
starlight({
  components: {
    PageSidebar: './src/components/overrides/PageSidebar.astro',
  },
});
```

### 5. Use it on a page

```md
---
title: A page with an aside
pageLayout: with-aside
---
```

Pages without `pageLayout: with-aside` render byte-for-byte the same right column Starlight would have produced on its own — this override never branches away from `<Default />`, only adds to it.
