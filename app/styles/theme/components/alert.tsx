import { type Components } from '@mui/material'

import { type Theme } from '../types'

export const MuiAlert = {
	styleOverrides: { message: { fontWeight: 500 } },
} satisfies Components<Theme>['MuiAlert']
