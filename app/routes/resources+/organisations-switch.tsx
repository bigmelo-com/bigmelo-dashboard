import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CaretUpDown as CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import * as React from 'react'
import { usePopover } from '@/hooks/use-popover.js'
import {
	type Organisations,
	organisationsApiResponseSchema,
} from '@/types/bigmelo/organisations.js'
import { get } from '@/utils/api.js'
import { requireAuthedSession } from '@/utils/auth.server.js'
import handleLoaderError from '@/utils/server/handleLoaderError.js'
import { verifyZodSchema } from '@/utils/verifyZodSchema.js'
import { useEffect } from 'react'
import { BuildingOffice as BuildingOfficeIcon } from '@phosphor-icons/react/dist/ssr/BuildingOffice'

export async function loader({ request }: LoaderFunctionArgs) {
	const { authHeader } = await requireAuthedSession(request)
	try {
		const organisationsResponse = await get('/v1/organization', {
			headers: {
				...authHeader,
			},
		})

		const verifiedOrganisations = verifyZodSchema(
			organisationsResponse.data,
			organisationsApiResponseSchema,
		)

		return json({
			organisations: verifiedOrganisations.data,
		})
	} catch (error) {
		return handleLoaderError(error)
	}
}

export function OrganisationsSwitch() {
	const organisationsFetcher = useFetcher<typeof loader>()

	const organisations = organisationsFetcher.data?.organisations ?? []

	const popover = usePopover<HTMLDivElement>()

	useEffect(() => {
		organisationsFetcher.submit(
			{},
			{
				method: 'get',
				action: '/resources/organisations-switch',
			},
		)
	}, [])

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
				{organisations.length > 0 ? (
					<>
						<Avatar variant="rounded">
							<BuildingOfficeIcon
								color="var(--Workspaces-expand-color)"
								fontSize="var(--icon-fontSize-lg)"
							/>
						</Avatar>
						<Box sx={{ flex: '1 1 auto' }}>
							<Typography
								color="var(--Workspaces-title-color)"
								variant="caption"
							>
								Organización
							</Typography>
							<Typography
								color="var(--Workspaces-name-color)"
								variant="subtitle2"
							>
								{organisations[0]?.name}
							</Typography>
						</Box>
						<CaretUpDownIcon
							color="var(--Workspaces-expand-color)"
							fontSize="var(--icon-fontSize-sm)"
						/>
					</>
				) : (
					<>
						<Avatar variant="rounded" />
						<Box sx={{ flex: '1 1 auto' }}>
							<Typography
								color="var(--Workspaces-title-color)"
								variant="caption"
							>
								No Workspaces
							</Typography>
						</Box>
					</>
				)}
			</Stack>
			<OrganisationsPopover
				anchorEl={popover.anchorRef.current}
				onChange={popover.handleClose}
				onClose={popover.handleClose}
				open={popover.open}
				organisations={organisations}
			/>
		</React.Fragment>
	)
}

export interface OrganisationsPopoverProps {
	organisations: Organisations
	anchorEl: null | Element
	onChange?: (tenant: string) => void
	onClose?: () => void
	open?: boolean
}

function OrganisationsPopover({
	organisations,
	anchorEl,
	onChange,
	onClose,
	open = false,
}: OrganisationsPopoverProps): React.JSX.Element {
	return (
		<Menu
			anchorEl={anchorEl}
			anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
			onClose={onClose}
			open={open}
			slotProps={{ paper: { sx: { width: '250px' } } }}
			transformOrigin={{ horizontal: 'right', vertical: 'top' }}
		>
			{organisations.map(organisation => (
				<MenuItem
					key={organisation.id}
					onClick={() => {
						onChange?.(organisation.name)
					}}
				>
					<ListItemAvatar>
						<Avatar sx={{ '--Avatar-size': '32px' }} variant="rounded">
							<BuildingOfficeIcon fontSize="var(--icon-fontSize-lg)" />
						</Avatar>
					</ListItemAvatar>
					{organisation.name}
				</MenuItem>
			))}
		</Menu>
	)
}
