// Zero-import metadata only. Safe to import from `content.config.ts`,
// which runs in a context that shouldn't have to compile `.astro` files —
// see `apps/site/src/layouts.meta.ts` for why this file is kept separate
// from `index.ts`.
export const fullWidthMeta = {
	id: 'full-width',
	/**
	 * Drops the right-hand table of contents column (via the app's
	 * `TwoColumnContent` dispatcher) and removes Starlight's content-width
	 * cap (via the app's `ContentPanel` dispatcher), so content actually
	 * fills the space freed up rather than leaving it empty.
	 */
	wide: true,
} as const;
