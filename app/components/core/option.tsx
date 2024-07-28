import MenuItem from '@mui/material/MenuItem'
import * as React from 'react'

export interface OptionProps {
	children: React.ReactNode
	disabled?: boolean
	value: string | number
}

export function Option({ children, ...props }: OptionProps): React.JSX.Element {
	return <MenuItem {...props}>{children}</MenuItem>
}
