import { type Components } from '@mui/material'

import { type Theme } from '../types'

export const MuiListItemIcon = {
	styleOverrides: {
		root: {
			color: 'inherit',
			fontSize: 'var(--icon-fontSize-md)',
			minWidth: 'auto',
		},
	},
} satisfies Components<Theme>['MuiListItemIcon']
