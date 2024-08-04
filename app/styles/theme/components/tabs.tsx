import { tabClasses, tabsClasses, type Components } from '@mui/material'

import { type Theme } from '../types'

export const MuiTabs = {
	styleOverrides: {
		flexContainer: {
			[`&:not(.${tabsClasses.flexContainerVertical})`]: { gap: '24px' },
		},
		indicator: {
			height: '4px',
			borderTopLeftRadius: '4px',
			borderTopRightRadius: '4px',
		},
		vertical: {
			[`& .${tabsClasses.indicator}`]: {
				borderBottomRightRadius: '4px',
				borderTopRightRadius: '4px',
				left: 0,
				right: 'auto',
				width: '4px',
			},
			[`& .${tabClasses.root}`]: {
				justifyContent: 'flex-start',
				paddingInline: '24px',
			},
		},
	},
} satisfies Components<Theme>['MuiTabs']
