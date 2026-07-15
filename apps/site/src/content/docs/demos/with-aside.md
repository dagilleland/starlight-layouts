---
title: With-aside layout
description: A demo page for the custom with-aside layout, which keeps the default table of contents and adds an extra callout panel beneath it.
pageLayout: with-aside
---

This page sets `pageLayout: with-aside`. The
[`PageSidebar` override](/tutorial/aside-layout/) renders Starlight's
default table of contents exactly as usual, then adds an extra callout
panel underneath it — look at the right-hand column on a wide viewport.

## An additive override

Unlike the [full-width](/demos/full-width/) and [minimal](/demos/minimal/)
layouts, which each *remove* something from the default page, this one only
*adds* to it. The override always renders `<Default />` for `PageSidebar`
and layers extra markup around it, rather than branching between two
different structures.

### Why that distinction matters

Additive overrides are lower-risk to introduce on an existing site: since
the default output is always rendered first, you can't accidentally break
the table of contents while building the extra panel — worst case, the
added markup is wrong, not the whole right column.

### A place for anything page-specific

The callout in the sidebar is static in this demo, but because it's an
ordinary Astro component (`AsideCallout.astro`) receiving props, it could
just as easily read page frontmatter to show a call-to-action, a related-
links list, or a feedback prompt that varies per page.
