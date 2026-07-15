import { dashboardMeta } from './layout.meta';

export const dashboardLayout = {
	...dashboardMeta,
};

// Not used by any dispatcher — consumed directly by MDX content pages that
// want a widget grid, e.g. `src/content/docs/demos/dashboard.mdx`.
export { default as DashboardGrid } from './DashboardGrid.astro';
export { default as Widget } from './Widget.astro';
