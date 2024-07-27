import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import { RouterLink } from '#app/components/core/link.js'

type CustomLogoutProps = {
	closePopover?: () => void
}

export const CustomLogout = ({ closePopover }: CustomLogoutProps) => {
	const handleLogout = () => {
		closePopover && closePopover()
	}

	return (
		<MenuItem
			component="div"
			onClick={handleLogout}
			sx={{ justifyContent: 'center' }}
		>
			<Link component={RouterLink} href="/logout" variant="subtitle2">
				Cerrar Sesión
			</Link>
		</MenuItem>
	)
}
