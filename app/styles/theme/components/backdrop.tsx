import { type Components, backdropClasses } from '@mui/material'

import { type Theme } from '../types'

export const MuiBackdrop = {
	styleOverrides: {
		root: {
			[`&:not(.${backdropClasses.invisible})`]: {
				backgroundColor: 'var(--mui-palette-Backdrop-bg)',
			},
		},
	},
} satisfies Components<Theme>['MuiBackdrop']
