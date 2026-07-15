// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Starlight Layouts',
			description:
				'A tutorial and live demo site for overriding Starlight components to build custom page layouts.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' },
			],
			customCss: ['./src/styles/global.css'],
			components: {
				PageFrame: './src/components/overrides/PageFrame.astro',
				TwoColumnContent: './src/components/overrides/TwoColumnContent.astro',
				PageSidebar: './src/components/overrides/PageSidebar.astro',
				ContentPanel: './src/components/overrides/ContentPanel.astro',
			},
			sidebar: [
				{
					label: 'Tutorial',
					items: [
						{ label: 'How overrides work', slug: 'tutorial/how-overrides-work' },
						{ label: 'Keeping defaults with frontmatter', slug: 'tutorial/conditional-defaults' },
						{ label: 'Building: full-width layout', slug: 'tutorial/full-width-layout' },
						{ label: 'Building: minimal layout', slug: 'tutorial/minimal-layout' },
						{ label: 'Building: layout with aside', slug: 'tutorial/aside-layout' },
						{ label: 'Building: dashboard layout', slug: 'tutorial/dashboard-layout' },
						{ label: 'Composing layout packages', slug: 'tutorial/composing-layout-packages' },
					],
				},
				{
					label: 'Guides',
					items: [{ label: 'Filling a dashboard', slug: 'guides/dashboard-widgets' }],
				},
				{
					label: 'Layout demos',
					items: [
						{ label: 'Default docs layout', slug: 'demos/default' },
						{ label: 'Splash (built-in)', slug: 'demos/splash' },
						{ label: 'Full-width', slug: 'demos/full-width' },
						{ label: 'Minimal', slug: 'demos/minimal' },
						{ label: 'With aside', slug: 'demos/with-aside' },
						{ label: 'Dashboard', slug: 'demos/dashboard' },
					],
				},
			],
		}),
	],

	vite: {
		plugins: [tailwindcss()],
	},
});
