import * as React from 'react'
import {
	SettingsContext,
	type SettingsContextValue,
} from '#app/contexts/settings.js'

export function useSettings(): SettingsContextValue {
	const context = React.useContext(SettingsContext)

	if (!context) {
		throw new Error('useSettings must be used within a SettingsProvider')
	}

	return context
}
