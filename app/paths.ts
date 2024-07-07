export const paths = {
	home: '/',
	checkout: '/checkout',
	contact: '/contact',
	pricing: '/pricing',
	auth: {
		custom: {
			signIn: '/auth/custom/sign-in',
			signUp: '/auth/custom/sign-up',
			resetPassword: '/auth/custom/reset-password',
		},
	},
	dashboard: {
		overview: '/dashboard',
		settings: {
			account: '/dashboard/settings/account',
			billing: '/dashboard/settings/billing',
			integrations: '/dashboard/settings/integrations',
			notifications: '/dashboard/settings/notifications',
			security: '/dashboard/settings/security',
			team: '/dashboard/settings/team',
		},
		academy: {
			browse: '/dashboard/academy',
			details: (courseId: string) => `/dashboard/academy/courses/${courseId}`,
		},
	},
	notAuthorized: '/errors/not-authorized',
	notFound: '/errors/not-found',
	internalServerError: '/errors/internal-server-error',
	docs: 'https://material-kit-pro-react-docs.devias.io',
	purchase: 'https://mui.com/store/items/devias-kit-pro',
} as const
