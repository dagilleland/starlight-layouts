---
title: Default docs layout
description: A baseline page with no layout frontmatter, for comparison against the custom layouts.
---

This page sets no `pageLayout` (and no `template`) frontmatter at all, so
every override on this site falls through to Starlight's own default
rendering: left navigation sidebar, right-hand table of contents, standard
content width.

Use it as the baseline to compare against the other demos:

- [Splash](/demos/splash/) — Starlight's own built-in full-width template.
- [Full-width](/demos/full-width/) — keeps the left sidebar, drops the TOC.
- [Minimal](/demos/minimal/) — drops both sidebar and TOC.
- [With aside](/demos/with-aside/) — keeps everything, adds an extra panel.
- [Dashboard](/demos/dashboard/) — keeps the left sidebar, drops the TOC,
  fills the reclaimed width with a widget grid.

## Some content to scroll through

Padding this out with a few headings makes the table of contents on the
right actually show something to compare against the other layouts.

### A first subsection

Regular paragraph text, same as any other Starlight docs page.

### A second subsection

```js
// Even code blocks render exactly as they normally would.
console.log('nothing about this page is customized');
```

### A third subsection

Nothing on this page reads
`Astro.locals.starlightRoute.entry.data.pageLayout` and gets anything
other than `undefined` back — which is exactly the point.
