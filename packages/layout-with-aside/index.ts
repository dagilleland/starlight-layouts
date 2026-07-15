import PageSidebarExtra from './PageSidebarExtra.astro';
import { withAsideMeta } from './layout.meta';

export const withAsideLayout = {
	...withAsideMeta,
	PageSidebarExtra,
};

// Re-exported in case other layouts or content pages want the same callout
// style — not currently used outside this package, but there's no reason
// to make it private.
export { default as AsideCallout } from './AsideCallout.astro';
