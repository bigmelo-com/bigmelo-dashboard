import { type Components } from '@mui/material'

import { type Theme } from '../types'

export const MuiPaper = {
	styleOverrides: { root: { backgroundImage: 'none' } },
} satisfies Components<Theme>['MuiPaper']
