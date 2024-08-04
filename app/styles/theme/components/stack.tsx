import { type Components } from '@mui/material'

import { type Theme } from '../types'

export const MuiStack = {
	defaultProps: { useFlexGap: true },
} satisfies Components<Theme>['MuiStack']
