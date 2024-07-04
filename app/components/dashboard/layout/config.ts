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
				{
					key: 'analytics',
					title: 'Analytics',
					href: paths.dashboard.overview,
					icon: 'chart-pie',
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
					href: paths.dashboard.settings.account,
					icon: 'gear',
					matcher: { type: 'startsWith', href: '/dashboard/settings' },
				},
				// {
				// 	key: 'customers',
				// 	title: 'Customers',
				// 	icon: 'users',
				// 	items: [
				// 		{
				// 			key: 'customers',
				// 			title: 'List customers',
				// 			href: paths.dashboard.customers.list,
				// 		},
				// 		{
				// 			key: 'customers:create',
				// 			title: 'Create customer',
				// 			href: paths.dashboard.customers.create,
				// 		},
				// 		{
				// 			key: 'customers:details',
				// 			title: 'Customer details',
				// 			href: paths.dashboard.customers.details('1'),
				// 		},
				// 	],
				// },
			],
		},
	],
} satisfies LayoutConfig
