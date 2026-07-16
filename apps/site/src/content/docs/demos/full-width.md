---
title: Full-width layout
description: A demo page for the custom full-width layout, which drops the right-hand table of contents so content can use the full available width.
pageLayout: full-width
---

This page sets `pageLayout: full-width` in its frontmatter. The
[`TwoColumnContent` override](/starlight-layouts/tutorial/full-width-layout/) reads that
value and skips rendering the right-hand table of contents column, and the
[`ContentPanel` override](/starlight-layouts/tutorial/dashboard-layout/) removes Starlight's
usual content-width cap so the content below actually fills the space that
frees up, rather than leaving it empty. The left navigation sidebar is
unaffected.

## Why this is useful

Wide tables, side-by-side code comparisons, and diagrams often fight with a
fixed-width content column. Compare this table to how cramped it would feel
on the [default layout](/starlight-layouts/demos/default/):

| Method       | Left sidebar | Right TOC | Content width | Typical use              |
| ------------ | ------------ | --------- | -------------- | ------------------------- |
| `default`    | ✅           | ✅        | Standard       | Regular docs pages        |
| `full-width` | ✅           | ❌        | Full           | Wide tables, diagrams     |
| `minimal`    | ❌           | ❌        | Full           | Standalone/landing pages  |
| `with-aside` | ✅           | ✅ + extra | Standard       | Pages needing a CTA panel |
| `dashboard`  | ✅           | ❌        | Full           | Widget grids              |

## Still a normal docs page

Everything else about this page — headings, code blocks, the left sidebar
navigation, pagination at the bottom — is untouched. Only the right column
(`TwoColumnContent`) and the content-width cap (`ContentPanel`) were
overridden for this `pageLayout` value; `PageFrame` still renders its
default branch here.
