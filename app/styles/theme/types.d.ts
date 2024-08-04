import { type CssVarsTheme, type Theme as BaseTheme } from '@mui/material'

export type Theme = Omit<BaseTheme, 'palette'> & CssVarsTheme

export type PrimaryColor =
	| 'chateauGreen'
	| 'neonBlue'
	| 'royalBlue'
	| 'tomatoOrange'

export type Direction = 'ltr' | 'rtl'

export type ColorScheme = 'dark' | 'light'
