import { invariantResponse } from '@epic-web/invariant'
import { Box, Button, Stack, Typography } from '@mui/material'
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus'
import {
	type LoaderFunctionArgs,
	json,
	type MetaFunction,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { organisationsApiResponseSchema } from '#app/types/bigmelo/organisations.js'
import { get } from '#app/utils/api.js'
import { requireAuthedSession } from '#app/utils/auth.server.js'
import handleLoaderError from '#app/utils/server/handleLoaderError.js'
import { verifyZodSchema } from '#app/utils/verifyZodSchema.js'

export const meta: MetaFunction = () => [{ title: 'Organización' }]

export async function loader({ request, params }: LoaderFunctionArgs) {
	const organisationId = params.organisationId ?? ''
	const parsedOrganisationId = parseInt(organisationId, 10)
	if (isNaN(parsedOrganisationId)) {
		invariantResponse(false, 'Organisation not found', {
			status: 404,
		})
	}

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

		const organisation = verifiedOrganisations.data.find(
			organisation => organisation.id === parsedOrganisationId,
		)

		invariantResponse(organisation, 'Organisation not found', {
			status: 404,
		})

		return json({
			organisation,
		})
	} catch (error) {
		return handleLoaderError(error)
	}
}

export default function Index() {
	const { organisation } = useLoaderData<typeof loader>()
	return (
		<Box
			sx={{
				maxWidth: 'var(--Content-maxWidth)',
				m: 'var(--Content-margin)',
				p: 'var(--Content-padding)',
				width: 'var(--Content-width)',
			}}
		>
			<Stack spacing={4}>
				<Stack
					direction={{ xs: 'column', sm: 'row' }}
					spacing={3}
					sx={{ alignItems: 'flex-start' }}
				>
					<Box sx={{ flex: '1 1 auto' }}>
						<Typography variant="h4">Dashboard: {organisation.name}</Typography>
					</Box>

					<Button startIcon={<PlusIcon />} variant="contained">
						Crear un Proyecto
					</Button>
				</Stack>
			</Stack>
		</Box>
	)
}
