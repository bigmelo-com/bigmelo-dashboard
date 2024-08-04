import {
	Avatar,
	Box,
	Divider,
	ListItemAvatar,
	Menu,
	MenuItem,
	Stack,
	Typography,
} from '@mui/material'
import { BuildingOffice as BuildingOfficeIcon } from '@phosphor-icons/react/dist/ssr/BuildingOffice'
import { CaretUpDown as CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown'
import { Check as CheckIcon } from '@phosphor-icons/react/dist/ssr/Check'
import { PlusSquare as PlusSquareIcon } from '@phosphor-icons/react/dist/ssr/PlusSquare'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
// import { useEffect } from 'react'
import {
	getCurrentOrganisationId,
	setCurrentOrganisationId,
} from '#app/utils/organisations.server.js'
import { usePopover } from '@/hooks/use-popover.js'
import {
	type Organisation,
	type Organisations,
	organisationsApiResponseSchema,
} from '@/types/bigmelo/organisations.js'
import { get } from '@/utils/api.js'
import { requireAuthedSession } from '@/utils/auth.server.js'
import handleLoaderError from '@/utils/server/handleLoaderError.js'
import { verifyZodSchema } from '@/utils/verifyZodSchema.js'

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

		const currentOrganisationId = getCurrentOrganisationId(request)

		let currentOrganisation = null

		// If the current organisation id is not null, find the organisation in the list
		if (currentOrganisationId !== null) {
			currentOrganisation = verifiedOrganisations.data.find(
				organisation => organisation.id === currentOrganisationId,
			)
		}

		// If the current organisation is not found, set it to the first organisation in the list
		if (!currentOrganisation && verifiedOrganisations.data.length > 0) {
			currentOrganisation = verifiedOrganisations.data[0]
		}

		// Update cookie with the current organisation id
		const responseInit = {
			headers: {
				'set-cookie': setCurrentOrganisationId(currentOrganisation?.id),
			},
		}

		return json(
			{
				organisations: verifiedOrganisations.data,
				currentOrganisation,
				currentOrganisationId,
			},
			responseInit,
		)
	} catch (error) {
		return handleLoaderError(error)
	}
}

export function OrganisationsSwitch() {
	const organisationsFetcher = useFetcher<typeof loader>()

	const organisations = organisationsFetcher.data?.organisations ?? []
	const currentOrganisationId = organisationsFetcher.data?.currentOrganisationId
	const currentOrganisation = organisationsFetcher.data?.currentOrganisation

	const popover = usePopover<HTMLDivElement>()

	// useEffect(() => {
	// 	organisationsFetcher.submit(
	// 		{},
	// 		{
	// 			method: 'get',
	// 			action: '/resources/organisations-switch',
	// 		},
	// 	)
	// }, [])

	return (
		<>
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
				{currentOrganisation ? (
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
								{currentOrganisation.name}
							</Typography>
						</Box>
						<CaretUpDownIcon
							color="var(--Workspaces-expand-color)"
							fontSize="var(--icon-fontSize-sm)"
						/>
					</>
				) : (
					<>
						<Avatar variant="rounded">
							<PlusSquareIcon fontSize="var(--icon-fontSize-lg)" />
						</Avatar>
						<Box sx={{ flex: '1 1 auto' }}>
							<Typography
								color="var(--Workspaces-title-color)"
								variant="caption"
							>
								Crear organización
							</Typography>
						</Box>
					</>
				)}
			</Stack>
			{organisations.length > 0 && currentOrganisationId ? (
				<OrganisationsPopover
					anchorEl={popover.anchorRef.current}
					onChange={popover.handleClose}
					onClose={popover.handleClose}
					open={popover.open}
					organisations={organisations}
					currentOrganisationId={currentOrganisationId}
				/>
			) : null}
		</>
	)
}

export interface OrganisationsPopoverProps {
	organisations: Organisations
	currentOrganisationId: Organisation['id']
	anchorEl: null | Element
	onChange?: (tenant: string) => void
	onClose?: () => void
	open?: boolean
}

function OrganisationsPopover({
	organisations,
	currentOrganisationId,
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
					{organisation.id === currentOrganisationId && <CheckIcon />}
				</MenuItem>
			))}
			<Divider />
			<MenuItem
				onClick={() => {
					console.log('Create new organisation')
				}}
			>
				<PlusSquareIcon fontSize="var(--icon-fontSize-lg)" />
				Nueva organización
			</MenuItem>
		</Menu>
	)
}
