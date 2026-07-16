---
title: Keeping defaults with frontmatter
description: How to add a custom frontmatter field and read it inside an override so a single component serves both default and custom-layout pages.
---

An override registered in `astro.config.mjs` applies to **every** page.
To let most pages keep Starlight's default layout while a few pages opt
into something custom, the override needs a per-page signal to branch on.
This site uses a custom frontmatter field for that.

## Extending the docs schema

Starlight's content collection schema (`docsSchema()`) already validates
frontmatter like `title`, `template`, and `hero`. It can be extended with
extra fields using Zod, which is how this project adds a `pageLayout`
field:

```ts title="apps/site/src/content.config.ts"
import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { layoutIds } from './layouts.meta';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: () =>
        z.object({
          pageLayout: z.enum([...layoutIds]).optional(),
        }),
    }),
  }),
};
```

(`layoutIds` is `['full-width', 'minimal', 'with-aside', 'dashboard']` today,
but it's derived from the installed layout packages rather than hardcoded —
see [Composing layout packages](/starlight-layouts/tutorial/composing-layout-packages/).)

Leaving `pageLayout` unset keeps the field optional — pages with no
`pageLayout` frontmatter fall through to Starlight's normal rendering
everywhere.

This is deliberately a **different field** from Starlight's own built-in
`template` (which only switches between `doc` and `splash`, see the
[Splash demo](/starlight-layouts/demos/splash/)). It's also deliberately *not* called
`layout`, even though that would've been the more obvious name: MDX files
already treat a truthy `layout` frontmatter key as an import path for an
Astro layout component to wrap the page in — a real, unrelated
`@astrojs/mdx` feature. Using that name for a plain string value on `.mdx`
pages fails the build with a confusing "failed to resolve import" error
rather than a schema validation error, since MDX intercepts it before
Starlight ever sees it. `pageLayout` avoids the collision entirely — pick
a name your content format's tooling doesn't already reserve.

## Reading it inside an override

Frontmatter for the current page is available in every override through
`Astro.locals.starlightRoute.entry.data`:

```astro title="The shape of the idea (simplified)"
---
import Default from '@astrojs/starlight/components/PageFrame.astro';

const { entry } = Astro.locals.starlightRoute;
const pageLayout = entry.data.pageLayout;
---

{pageLayout === 'minimal' ? (
  <div class="page sl-flex">{/* custom markup */}</div>
) : (
  <Default>
    <slot name="header" slot="header" />
    <slot name="sidebar" slot="sidebar" />
    <slot />
  </Default>
)}
```

Two things worth calling out:

1. **Slot forwarding.** When the default branch renders `<Default>`, any
   named slots passed into your override (`header`, `sidebar`) have to be
   re-forwarded into it explicitly with `<slot name="x" slot="x" />` —
   Astro doesn't do this automatically just because the tag names match.
2. **The condition lives in one place.** Every layout on this site is
   identified by a plain string, checked against `entry.data.pageLayout`.
   Nothing about routing, file paths, or URL patterns is involved — it's
   just frontmatter.

This project's actual `apps/site/src/components/overrides/PageFrame.astro`
looks slightly different from the snippet above — instead of the `'minimal'
? custom-markup : Default` check inline, it looks up the active layout in a
small registry and renders whatever component that layout provides. Same
idea, one extra layer of indirection so the `custom markup` part can live
in its own package instead of inline here.
[Composing layout packages](/starlight-layouts/tutorial/composing-layout-packages/) covers
why and how, once all four layouts are built.

## Set on a page

Add the field to any page's frontmatter and the site's registered
overrides will pick it up automatically:

```md title="apps/site/src/content/docs/demos/full-width.md"
---
title: Full-width layout
pageLayout: full-width
---
```

The next four pages build the override logic for each of the four
`pageLayout` values used on this site — and the page after those explains
how each one ended up as its own package.
