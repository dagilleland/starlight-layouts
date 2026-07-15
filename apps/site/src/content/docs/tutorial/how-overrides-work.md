---
title: How component overrides work
description: What Starlight component overrides are, which components can be overridden, and the Default-import pattern for extending rather than replacing them.
---

Starlight renders every page by composing a fixed tree of components —
`Header`, `Sidebar`, `TableOfContents`, `Footer`, and so on. The
[`components`](https://starlight.astro.build/reference/configuration/#components)
option in `astro.config.mjs` lets you swap any one of them for your own
Astro component, site-wide.

## Which components can be overridden

Starlight validates the `components` option against a fixed schema, so only
a specific list of components are swappable — things like `Header`,
`Sidebar`, `PageFrame`, `TwoColumnContent`, `PageSidebar`, `Footer`, `Hero`,
and a few dozen others. Every internal Starlight component that *isn't* in
that list (helpers like `SidebarSublist` or `AnchorHeading`) is not
overridable on its own.

The four components this site overrides are:

- **`PageFrame`** — the outermost shell: header, left navigation sidebar,
  and a wrapper around everything else.
- **`TwoColumnContent`** — wraps the main content pane and the right-hand
  table-of-contents column.
- **`PageSidebar`** — the content rendered inside that right-hand column
  (normally just the table of contents).
- **`ContentPanel`** — wraps the page title and the page body, and caps
  their width for readability.

Registering an override looks like this:

```js title="apps/site/astro.config.mjs"
starlight({
  components: {
    PageFrame: './src/components/overrides/PageFrame.astro',
    TwoColumnContent: './src/components/overrides/TwoColumnContent.astro',
    PageSidebar: './src/components/overrides/PageSidebar.astro',
    ContentPanel: './src/components/overrides/ContentPanel.astro',
  },
});
```

Once registered, **every** page on the site renders through your component
instead of Starlight's. That's the catch this tutorial spends most of its
time on: a naive override throws away Starlight's own layout for every
single page, even the ones where you wanted to keep it.

## The `Default` import pattern

The fix is to never fully replace a component — wrap it instead. Starlight
publishes every default component at a stable import path, so your override
can import the original and render it for the common case:

```astro title="src/components/overrides/Footer.astro"
---
import Default from '@astrojs/starlight/components/Footer.astro';

const showBanner = false; // some condition
---

{showBanner && <p class="my-custom-banner">Custom content here</p>}
<Default {...Astro.props}><slot /></Default>
```

This override still renders Starlight's real footer — last-updated date,
pagination links, edit link — and simply adds something extra around it.
Nothing about the default layout was thrown away.

The next page turns that `showBanner` placeholder into something driven by
page frontmatter, which is how every layout on this site actually decides
whether to render the default or something custom.

## Try it

Open `apps/site/src/components/overrides/PageFrame.astro` in this project —
it imports `@astrojs/starlight/components/PageFrame.astro` as `Default` and
only branches away from it for one specific case. The next page explains
how that branch is decided; a later page explains why this project keeps
that branch's actual markup in a separate package rather than inline in
this same file.
