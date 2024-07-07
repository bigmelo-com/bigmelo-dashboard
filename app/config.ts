// import { getSiteURL } from '@/lib/get-site-url'
// import { LogLevel } from '@/lib/logger'

import { type ColorScheme, type PrimaryColor } from './styles/theme/types'

export interface Config {
	site: {
		name: string
		description: string
		colorScheme: ColorScheme
		primaryColor: PrimaryColor
		themeColor: string
		// url: string
		version: string
	}
	// logLevel: keyof typeof LogLevel
}

export const config = {
	site: {
		name: 'Bigmelo',
		description: '',
		colorScheme: 'light',
		themeColor: '#090a0b',
		primaryColor: 'neonBlue',
		// url: getSiteURL(),
		version: import.meta.env.VITE_SITE_VERSION || '0.0.0',
	},
	// logLevel:
	// 	(import.meta.env.VITE_LOG_LEVEL as keyof typeof LogLevel) || LogLevel.ALL,
} satisfies Config
