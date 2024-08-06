import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import {
	Avatar,
	Box,
	CircularProgress,
	Divider,
	ListItemAvatar,
	Menu,
	MenuItem,
	Stack,
	Typography,
} from '@mui/material'
import { BuildingOffice as BuildingOfficeIcon } from '@phosphor-icons/react/dist/ssr/BuildingOffice'
import { CaretUpDown as CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown'
import { PlusSquare as PlusSquareIcon } from '@phosphor-icons/react/dist/ssr/PlusSquare'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { useFetcher, useNavigate } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
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

const organisationsIdFormSchema = z.object({
	organisationId: z.number().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const { authHeader } = await requireAuthedSession(request)
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: organisationsIdFormSchema,
	})

	invariantResponse(
		submission.status === 'success',
		'Invalid organisationId received',
	)

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

		const { organisationId } = submission.value

		const currentOrganisationId =
			organisationId ?? getCurrentOrganisationId(request)

		let currentOrganisation = verifiedOrganisations.data.find(
			organisation => organisation.id === currentOrganisationId,
		)

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
	const fetcher = useFetcher<typeof action>()
	const navigate = useNavigate()

	const organisations = fetcher.data?.organisations ?? []
	const currentOrganisationId = fetcher.data?.currentOrganisationId
	const currentOrganisation = fetcher.data?.currentOrganisation

	const [hasInitialFetch, setHasInitialFetch] = useState(false)

	const popover = usePopover<HTMLDivElement>()

	useEffect(() => {
		if (!hasInitialFetch) {
			fetcher.submit(
				{},
				{
					method: 'POST',
					action: '/resources/organisations-switch',
				},
			)
			setHasInitialFetch(true)
		}
	}, [hasInitialFetch, fetcher, setHasInitialFetch])

	const handleChangeOrganisation = (id: Organisation['id']) => {
		fetcher.submit(
			{ organisationId: id },
			{
				method: 'POST',
				action: '/resources/organisations-switch',
			},
		)
		navigate(`/dashboard/${id}`)
		popover.handleClose()
	}

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
				{fetcher.state === 'loading' ||
				fetcher.state === 'submitting' ||
				!hasInitialFetch ? (
					<Box
						sx={{
							flex: '1 1 auto',
							height: 40,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							gap: 1,
						}}
					>
						<CircularProgress size={30} />
						<Typography color="var(--Workspaces-name-color)" variant="caption">
							Cargando...
						</Typography>
					</Box>
				) : currentOrganisation ? (
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
					onChange={handleChangeOrganisation}
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
	onChange?: (organisationId: Organisation['id']) => void
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
						onChange?.(organisation.id)
					}}
					selected={currentOrganisationId === organisation.id}
				>
					<ListItemAvatar>
						<Avatar sx={{ '--Avatar-size': '32px' }} variant="rounded">
							<BuildingOfficeIcon fontSize="var(--icon-fontSize-lg)" />
						</Avatar>
					</ListItemAvatar>
					{organisation.name}
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
