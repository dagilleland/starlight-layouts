---
title: Minimal layout
description: A demo page for the custom minimal layout, which drops both the left navigation sidebar and the right-hand table of contents.
pageLayout: minimal
---

This page sets `pageLayout: minimal`. Three overrides react to it at once:

- [`PageFrame`](/starlight-layouts/tutorial/minimal-layout/) skips rendering the left
  navigation sidebar entirely.
- [`TwoColumnContent`](/starlight-layouts/tutorial/full-width-layout/) skips the right-hand
  table of contents, same as the [full-width demo](/starlight-layouts/demos/full-width/).
- [`ContentPanel`](/starlight-layouts/tutorial/dashboard-layout/) removes Starlight's usual
  content-width cap, so this text fills the width freed up by dropping
  both sidebars instead of sitting in a narrow column with empty space on
  either side.

The result is just a header and this content — no sidebar navigation on
either side. Try navigating here directly (rather than clicking a sidebar
link) to see how it feels as a standalone page.

## When to reach for this

Pages that shouldn't feel like part of the docs tree at all: a print-
friendly version of a page, an embeddable page loaded in an iframe, or a
one-off landing section that needs the reader's full attention without
navigation chrome pulling focus away.

## Getting back

There's no sidebar here to click through, so here's a link back to the
[default layout demo](/starlight-layouts/demos/default/) instead.
