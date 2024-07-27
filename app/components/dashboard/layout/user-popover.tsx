import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItemIcon from '@mui/material/ListItemIcon'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User'
import * as React from 'react'

import { useOptionalUser } from '#app/utils/user.js'
import { CustomLogout } from './custom-sign-out'
import { RouterLink } from '@/components/core/link'
import { paths } from '@/paths'

export interface UserPopoverProps {
	anchorEl: null | Element
	onClose?: () => void
	open: boolean
}

export function UserPopover({
	anchorEl,
	onClose,
	open,
}: UserPopoverProps): React.JSX.Element {
	const user = useOptionalUser()
	return (
		<Popover
			anchorEl={anchorEl}
			anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			onClose={onClose}
			open={Boolean(open)}
			slotProps={{ paper: { sx: { width: '280px' } } }}
			transformOrigin={{ horizontal: 'right', vertical: 'top' }}
		>
			<Box sx={{ p: 2 }}>
				<Typography>
					{user?.firstName} {user?.lastName}
				</Typography>
				<Typography color="text.secondary" variant="body2">
					{user?.email}
				</Typography>
			</Box>
			<Divider />
			<List sx={{ p: 1 }}>
				<MenuItem
					component={RouterLink}
					href={paths.dashboard.settings.profile}
					onClick={onClose}
				>
					<ListItemIcon>
						<UserIcon />
					</ListItemIcon>
					Account
				</MenuItem>
				{/* <MenuItem
					component={RouterLink}
					href={paths.dashboard.settings.profile}
					onClick={onClose}
				>
					<ListItemIcon>
						<LockKeyIcon />
					</ListItemIcon>
					Security
				</MenuItem> */}
			</List>
			<Divider />
			<Box sx={{ p: 1 }}>
				<CustomLogout closePopover={onClose} />
			</Box>
		</Popover>
	)
}
