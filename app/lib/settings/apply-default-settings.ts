import { config } from '#app/config.js'
import { type Settings } from '#app/types/settings.js'

export function applyDefaultSettings(settings: Partial<Settings>): Settings {
	return {
		colorScheme: config.site.colorScheme,
		primaryColor: config.site.primaryColor,
		direction: 'ltr',
		navColor: 'evident',
		layout: 'vertical',
		...settings,
	}
}
