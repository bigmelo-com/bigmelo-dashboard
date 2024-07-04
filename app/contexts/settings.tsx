'use client'

import * as React from 'react'
import { applyDefaultSettings } from '#app/lib/settings/apply-default-settings.js'
import { type Settings } from '#app/types/settings.js'

export interface SettingsContextValue {
	settings: Settings
	setSettings: (settings: Settings) => void
}

export const SettingsContext = React.createContext<SettingsContextValue>({
	settings: applyDefaultSettings({}),
	setSettings: () => {
		// noop
	},
})

export interface SettingsProviderProps {
	children: React.ReactNode
	settings: Settings
}

export function SettingsProvider({
	children,
	settings: initialSettings,
}: SettingsProviderProps): React.JSX.Element {
	const [state, setState] = React.useState<Settings>(initialSettings)

	React.useEffect(() => {
		setState(initialSettings)
	}, [initialSettings])

	return (
		<SettingsContext.Provider
			value={{
				settings: state,
				setSettings: (newSettings: Settings) => {
					setState(newSettings)
				},
			}}
		>
			{children}
		</SettingsContext.Provider>
	)
}

export const SettingsConsumer = SettingsContext.Consumer
