---
title: "Building: minimal layout"
description: Overriding PageFrame to drop the left navigation sidebar entirely, and handling a CSS variable that leaks through from Page.astro.
---

The **minimal** layout strips away both the left navigation sidebar and the
right-hand table of contents, leaving just the header and the page content.
It's useful for standalone pages — a print view, an embed, a one-off
landing section — that shouldn't feel like part of the docs tree.

See it live: [`/demos/minimal/`](/demos/minimal/).

## Why `PageFrame` this time

The left sidebar is rendered by `PageFrame`, not `TwoColumnContent` (which
only controls the *right* column — see the
[full-width layout](/tutorial/full-width-layout/)). Removing the left nav
means overriding `PageFrame` and skipping the `<nav>` it normally renders
around the `sidebar` slot.

The app's `PageFrame` override is a thin dispatcher — it looks up the
active layout and renders whatever `PageFrame` component that layout
provides, or Starlight's own default if it doesn't provide one:

```astro title="apps/site/src/components/overrides/PageFrame.astro"
---
import Default from '@astrojs/starlight/components/PageFrame.astro';
import { getLayout } from '../../layouts.config';

const { entry } = Astro.locals.starlightRoute;
const layout = getLayout(entry.data.pageLayout);
const Custom = layout?.PageFrame;
---

{Custom ? (
  <Custom>
    <slot name="header" slot="header" />
    <slot />
  </Custom>
) : (
  <Default>
    <slot name="header" slot="header" />
    <slot name="sidebar" slot="sidebar" />
    <slot />
  </Default>
)}
```

The actual "no sidebar" markup — the part that matters for this layout —
lives in the `layout-minimal` package, not in the dispatcher above:

```astro title="packages/layout-minimal/PageFrame.astro"
<div class="page sl-flex">
  <header class="header"><slot name="header" /></header>
  <div class="main-frame main-frame--minimal">
    <slot />
  </div>
</div>
```

It renders the header slot as usual but simply never renders a `sidebar`
slot at all — Starlight still computes the sidebar navigation for the
page, but nothing here asks for it. [Composing layout packages](/tutorial/composing-layout-packages/)
covers why this split exists.

## The leaking CSS variable

Starlight's `Page.astro` (not overridable — it's the component that
assembles `PageFrame`, `TwoColumnContent`, and everything else) sets a
`data-has-sidebar` attribute on `<html>` based on whether the sidebar
config has entries for the current route:

```astro
const htmlDataAttributes = {};
if (starlightRoute.hasSidebar) htmlDataAttributes['data-has-sidebar'] = '';
```

That attribute is what drives `--sl-content-inline-start`, reserving space
for the sidebar's width — regardless of whether the active layout's
`PageFrame` component actually rendered one. Left alone, minimal pages
would show a sidebar-sized gap on the left with nothing in it.

The fix is a scoped CSS override, shipped alongside the markup above in
the same package file (`packages/layout-minimal/PageFrame.astro`):

```astro
<style>
  @layer starlight.core {
    .main-frame--minimal {
      padding-top: var(--sl-nav-height);
      padding-inline-start: 0;
    }
  }
</style>
```

This is a good example of why overriding a component isn't always
self-contained — it's worth reading the component *above* the one you're
overriding (`Page.astro` here) to catch attributes or variables it sets
based on state your override no longer reflects.

## Combined with the full-width override

`packages/layout-minimal/layout.meta.ts` also sets `wide: true`, the same
flag `full-width` sets — so this layout automatically gets the
[`TwoColumnContent` override](/tutorial/full-width-layout/) (drops the
right TOC column) and the
[`ContentPanel` override](/tutorial/dashboard-layout/) (removes
Starlight's content-width cap) for free. No extra code needed in either
dispatcher; both already check `layout?.wide` rather than a specific
layout name.
