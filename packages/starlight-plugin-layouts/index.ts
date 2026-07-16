// A Starlight plugin that bundles all four `@dagilleland/layout-*`
// packages and wires them up automatically: it registers the four
// dispatcher overrides (PageFrame, TwoColumnContent, PageSidebar,
// ContentPanel) from a single `plugins: [starlightLayouts()]` line — no
// override files to create.
//
// Two things a Starlight plugin genuinely cannot do:
//
// - Extend the `docs` content collection's schema. The `pageLayout`
//   frontmatter field is still a one-line manual addition to
//   `content.config.ts` — see the README, or `layoutIds`/`LayoutId`
//   exported below, which build that field from the same source of truth
//   this plugin uses internally instead of retyping the four layout names
//   by hand.
// - Register a Tailwind content source from `customCss`. Tailwind v4 only
//   honors `@source` inside the same CSS module graph as the file that
//   actually imports `tailwindcss` itself — a separate `customCss` array
//   entry is a disconnected root, so `@source` there is silently inert
//   (confirmed by checking the built CSS: the classes never show up).
//   `tailwind.css` in this package still exists as a convenience — one
//   `@import` instead of four — but it's a manual addition to your own
//   Tailwind entry file, same as installing the four layout packages
//   individually. See the README.
//
// This plugin claims all four override slots for itself. Don't also set
// PageFrame/TwoColumnContent/PageSidebar/ContentPanel directly in your own
// `starlight()` config, or combine this with another plugin that touches
// the same slots — whichever one runs last in `plugins: [...]` wins, and
// Starlight doesn't warn about the collision.
//
// See: tutorial/starlight-plugin.md
import type { StarlightPlugin } from '@astrojs/starlight/types';

export { layoutIds } from './layouts.meta';
export type { LayoutId } from './layouts.meta';

export default function starlightLayouts(): StarlightPlugin {
	return {
		name: '@dagilleland/starlight-plugin-layouts',
		hooks: {
			'config:setup'({ config, updateConfig }) {
				updateConfig({
					components: {
						...config.components,
						PageFrame: '@dagilleland/starlight-plugin-layouts/overrides/PageFrame.astro',
						TwoColumnContent:
							'@dagilleland/starlight-plugin-layouts/overrides/TwoColumnContent.astro',
						PageSidebar: '@dagilleland/starlight-plugin-layouts/overrides/PageSidebar.astro',
						ContentPanel: '@dagilleland/starlight-plugin-layouts/overrides/ContentPanel.astro',
					},
				});
			},
		},
	};
}
