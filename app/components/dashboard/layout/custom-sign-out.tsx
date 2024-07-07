import MenuItem from '@mui/material/MenuItem'
import * as React from 'react'

export function CustomSignOut(): React.JSX.Element {
	const handleSignOut = () => {
		console.log('signing out')
	}

	return (
		<MenuItem
			component="div"
			onClick={handleSignOut}
			sx={{ justifyContent: 'center' }}
		>
			Sign out
		</MenuItem>
	)
}
