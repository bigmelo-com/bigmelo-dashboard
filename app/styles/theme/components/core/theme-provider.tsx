import CssBaseline from '@mui/material/CssBaseline'
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles'
import * as React from 'react'
import { config } from '#app/config.js'
import { createTheme } from '../../create-theme'

export interface ThemeProviderProps {
	children: React.ReactNode
}

export function ThemeProvider({
	children,
}: ThemeProviderProps): React.JSX.Element {
	const theme = createTheme({
		primaryColor: config.site.primaryColor,
		colorScheme: config.site.colorScheme,
		direction: 'ltr',
	})

	return (
		<CssVarsProvider
			defaultColorScheme={config.site.colorScheme}
			defaultMode={config.site.colorScheme}
			theme={theme}
		>
			{/* <Helmet>
        <meta content={settings.colorScheme} name="color-scheme" />
      </Helmet> */}
			{children}
			<CssBaseline />
		</CssVarsProvider>
	)
}
