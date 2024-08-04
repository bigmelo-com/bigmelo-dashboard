import { type Components } from '@mui/material'

import { type Theme } from '../types'

export const MuiButtonBase = {
	defaultProps: { disableRipple: true },
} satisfies Components<Theme>['MuiButtonBase']
