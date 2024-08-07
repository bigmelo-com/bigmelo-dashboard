import { type Components } from '@mui/material'

import { type Theme } from '../types'

export const MuiLink = {
	defaultProps: { underline: 'hover' },
} satisfies Components<Theme>['MuiLink']
