import MenuItem from '@mui/material/MenuItem'
import { Form } from '@remix-run/react'

type CustomSignOutProps = {
	closePopover?: () => void
}

export const CustomSignOut = ({ closePopover }: CustomSignOutProps) => {
	const handleSignOut = () => {
		closePopover && closePopover()
	}

	return (
		<MenuItem
			component="div"
			onClick={handleSignOut}
			sx={{ justifyContent: 'center' }}
		>
			<Form action="/logout" method="POST">
				<button type="submit">Logout</button>
			</Form>
		</MenuItem>
	)
}
