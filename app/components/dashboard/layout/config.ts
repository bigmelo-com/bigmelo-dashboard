import { paths } from '#app/paths.js'
import { type NavItemConfig } from '#app/types/nav.js'

export interface LayoutConfig {
	navItems: NavItemConfig[]
}

export const layoutConfig = {
	navItems: [
		{
			key: 'dashboards',
			title: 'Dashboards',
			items: [
				{
					key: 'overview',
					title: 'Overview',
					href: paths.dashboard.overview,
					icon: 'house',
				},
			],
		},
		{
			key: 'general',
			title: 'General',
			items: [
				{
					key: 'settings',
					title: 'Settings',
					href: paths.dashboard.settings.profile,
					icon: 'gear',
					matcher: { type: 'startsWith', href: '/dashboard/settings/profile' },
				},
			],
		},
	],
} satisfies LayoutConfig
