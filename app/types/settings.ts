import {
	type ColorScheme,
	type Direction,
	type PrimaryColor,
} from '#app/styles/theme/types.js'

export type Layout = 'horizontal' | 'vertical'

export type NavColor = 'blend_in' | 'discrete' | 'evident'

export interface Settings {
	primaryColor: PrimaryColor
	colorScheme: ColorScheme
	direction?: Direction
	layout?: Layout
	navColor?: NavColor
}
