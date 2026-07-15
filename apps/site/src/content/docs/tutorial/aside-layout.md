---
title: "Building: layout with aside"
description: Overriding PageSidebar to add extra content alongside the default table of contents, instead of replacing it.
pageLayout: with-aside
---

The first two layouts *removed* pieces of the default page. This one
**adds** to it: the right-hand column keeps Starlight's normal table of
contents, plus a callout panel underneath it. This page uses that layout
itself — look at the right-hand column now.

See it live: [`/demos/with-aside/`](/demos/with-aside/).

## Why `PageSidebar`

The right column's *content* — as opposed to the two-column arrangement
itself, covered by [`TwoColumnContent`](/tutorial/full-width-layout/) — is
rendered by `PageSidebar`. Overriding it means we can render Starlight's
own `PageSidebar` for the table of contents and simply put more markup
after it.

The app's `PageSidebar` override is a thin dispatcher, same shape as
`PageFrame`'s: it always renders `<Default />`, then additionally renders
whatever `PageSidebarExtra` component the active layout provides, if any:

```astro title="apps/site/src/components/overrides/PageSidebar.astro"
---
import Default from '@astrojs/starlight/components/PageSidebar.astro';
import { getLayout } from '../../layouts.config';

const { entry } = Astro.locals.starlightRoute;
const layout = getLayout(entry.data.pageLayout);
const Extra = layout?.PageSidebarExtra;
---

<Default />
{Extra && <Extra />}
```

Unlike the `PageFrame` and `TwoColumnContent` overrides, this one doesn't
branch between "custom component" and "`<Default>`" — it **always** renders
`<Default />`, and conditionally renders something extra alongside it. Both
are valid uses of the same `Default`-import pattern from
[the first tutorial page](/tutorial/how-overrides-work/): branching to
replace, or unconditionally rendering the default and layering on top.

The actual callout panel — the part that matters for this layout — lives
in the `layout-with-aside` package:

```astro title="packages/layout-with-aside/PageSidebarExtra.astro"
---
import AsideCallout from './AsideCallout.astro';
---

<div class="extra-aside sl-hidden lg:sl-block">
  <AsideCallout title="Layout tip">
    This panel is rendered by our <code>PageSidebar</code> override.
  </AsideCallout>
</div>
```

[Composing layout packages](/tutorial/composing-layout-packages/) covers
why the dispatcher and the layout's actual markup live in different places.

## `AsideCallout`, a plain component

`AsideCallout` isn't a Starlight override at all — it's an ordinary Astro
component that `PageSidebarExtra.astro` imports, the same way any Astro
project shares UI between components. It lives in the same package rather
than the app, since nothing outside `layout-with-aside` uses it (yet):

```astro title="packages/layout-with-aside/AsideCallout.astro"
---
interface Props {
  title: string;
}
const { title } = Astro.props;
---

<div class="rounded-lg border border-[var(--sl-color-hairline)] bg-[var(--sl-color-bg-sidebar)] p-4">
  <p class="m-0 mb-2 text-sm font-semibold text-[var(--sl-color-white)]">{title}</p>
  <div class="text-xs leading-relaxed text-[var(--sl-color-gray-2)] [&_a]:text-[var(--sl-color-text-accent)]">
    <slot />
  </div>
</div>
```

Styling here is plain [Tailwind](https://tailwindcss.com) utility classes —
this project has Tailwind set up alongside Starlight following
[Starlight's own Tailwind guide](https://starlight.astro.build/guides/css-and-tailwind/),
which layers Tailwind's utilities underneath Starlight's own styles so
neither fights the other. The border, background, and text colors above
reference Starlight's own CSS custom properties (`--sl-color-*`) via
Tailwind's arbitrary-value syntax (`bg-[var(--sl-color-bg-sidebar)]`), so
the callout automatically matches the site's light/dark theme without
hardcoding colors of its own.

The `PageFrame` and `TwoColumnContent` overrides earlier in this tutorial
intentionally *don't* use Tailwind — their `<style>` blocks mirror
Starlight's own default components property-for-property, so keeping them
in plain CSS made the diff against the originals easier to follow. Reach
for Tailwind on net-new UI like this one; when an override is mostly
replicating existing Starlight markup, copying its existing style approach
keeps things easier to compare.

Splitting it three ways — the app's dispatcher decides *whether* to render
something extra, `PageSidebarExtra.astro` decides *where* the callout goes,
and `AsideCallout.astro` owns *what it looks like* — keeps each piece
focused, and makes `AsideCallout` reusable elsewhere (in page content via
MDX, for instance) without dragging the layout-dispatch logic along with
it.

## Set on a page

```md title="apps/site/src/content/docs/demos/with-aside.md"
---
title: With-aside layout
pageLayout: with-aside
---
```

Since this override only ever adds to the default `PageSidebar`, pages
without `pageLayout: with-aside` render byte-for-byte the same right
column Starlight would have produced on its own.
