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
					/**
					 * Custom layout switch consumed by our own component overrides
					 * (see `src/components/overrides/`). Separate from Starlight's
					 * built-in `template` field, which only toggles `doc` vs `splash`.
					 *
					 * Named `pageLayout` rather than `layout` because `@astrojs/mdx`
					 * treats a truthy `layout` frontmatter key on any `.mdx` file as
					 * an import path for an Astro layout component to wrap the page
					 * in — a real, unrelated feature that would otherwise collide
					 * with this one and fail the build.
					 *
					 * The allowed values come from `layoutIds`, derived from every
					 * installed `@dagilleland/layout-*` package rather than
					 * hand-maintained here — see `layouts.meta.ts`.
					 */
					pageLayout: z.enum([...layoutIds]).optional(),
				}),
		}),
	}),
};
