import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CaretUpDown as CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown'
import * as React from 'react'

import { usePopover } from '#app/hooks/use-popover.js'

export function WorkspacesSwitch(): React.JSX.Element {
	const popover = usePopover<HTMLDivElement>()
	const workspace = workspaces[0]

	return (
		<React.Fragment>
			<Stack
				direction="row"
				onClick={popover.handleOpen}
				ref={popover.anchorRef}
				spacing={2}
				sx={{
					alignItems: 'center',
					border: '1px solid var(--Workspaces-border-color)',
					borderRadius: '12px',
					cursor: 'pointer',
					p: '4px 8px',
				}}
			>
				<Avatar src={workspace?.avatar} variant="rounded" />
				<Box sx={{ flex: '1 1 auto' }}>
					<Typography color="var(--Workspaces-title-color)" variant="caption">
						Workspace
					</Typography>
					<Typography color="var(--Workspaces-name-color)" variant="subtitle2">
						{workspace?.name}
					</Typography>
				</Box>
				<CaretUpDownIcon
					color="var(--Workspaces-expand-color)"
					fontSize="var(--icon-fontSize-sm)"
				/>
			</Stack>
			<WorkspacesPopover
				anchorEl={popover.anchorRef.current}
				onChange={popover.handleClose}
				onClose={popover.handleClose}
				open={popover.open}
			/>
		</React.Fragment>
	)
}

const workspaces = [
	{ name: 'Devias', avatar: '/assets/workspace-avatar-1.png' },
	{ name: 'Carpatin', avatar: '/assets/workspace-avatar-2.png' },
] satisfies Workspaces[]

export interface Workspaces {
	name: string
	avatar: string
}

export interface WorkspacesPopoverProps {
	anchorEl: null | Element
	onChange?: (tenant: string) => void
	onClose?: () => void
	open?: boolean
}

function WorkspacesPopover({
	anchorEl,
	onChange,
	onClose,
	open = false,
}: WorkspacesPopoverProps): React.JSX.Element {
	return (
		<Menu
			anchorEl={anchorEl}
			anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			onClose={onClose}
			open={open}
			slotProps={{ paper: { sx: { width: '250px' } } }}
			transformOrigin={{ horizontal: 'right', vertical: 'top' }}
		>
			{workspaces.map(workspace => (
				<MenuItem
					key={workspace.name}
					onClick={() => {
						onChange?.(workspace.name)
					}}
				>
					<ListItemAvatar>
						<Avatar
							src={workspace.avatar}
							sx={{ '--Avatar-size': '32px' }}
							variant="rounded"
						/>
					</ListItemAvatar>
					{workspace.name}
				</MenuItem>
			))}
		</Menu>
	)
}
