import { type Components } from '@mui/material'

import { type Theme } from '../types'

export const MuiListItem = {
	styleOverrides: { root: { gap: 'var(--ListItem-gap)' } },
} satisfies Components<Theme>['MuiListItem']
