import { invariantResponse } from '@epic-web/invariant'
import { Box, Button, Grid, Stack, Typography } from '@mui/material'
import { ListChecks as ListChecksIcon } from '@phosphor-icons/react/dist/ssr/ListChecks'
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus'
import {
	type LoaderFunctionArgs,
	json,
	type MetaFunction,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Summary } from '#app/components/dashboard/overview/summary.js'
import { dailyTotalsApiResponseSchema } from '#app/types/bigmelo/dailyTotals.js'
import { organisationsApiResponseSchema } from '#app/types/bigmelo/organisations.js'
import { get } from '#app/utils/api.js'
import { requireAuthedSession } from '#app/utils/auth.server.js'
import { setCurrentOrganisationId } from '#app/utils/organisations.server.js'
import handleLoaderError from '#app/utils/server/handleLoaderError.js'
import { verifyZodSchema } from '#app/utils/verifyZodSchema.js'

export const meta: MetaFunction = () => [{ title: 'Organización' }]

export async function loader({ request, params }: LoaderFunctionArgs) {
	const { authHeader } = await requireAuthedSession(request)
	try {
		const organisationId = params.organisationId ?? ''
		const parsedOrganisationId = parseInt(organisationId, 10)
		if (isNaN(parsedOrganisationId)) {
			invariantResponse(false, 'Organisation not found', {
				status: 404,
			})
		}

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

		const responseInit = {
			headers: {
				'set-cookie': setCurrentOrganisationId(organisation?.id),
			},
		}

		invariantResponse(organisation, 'Organisation not found', {
			status: 404,
		})

		// TODO: Implement the daily totals API per organisation
		const dailyTotalsResponse = await get('/v1/admin-dashboard/daily-totals', {
			headers: {
				...authHeader,
			},
		})

		const dailyTotals = verifyZodSchema(
			dailyTotalsResponse.data,
			dailyTotalsApiResponseSchema,
		)

		return json(
			{
				dailyTotals: dailyTotals.data,
				organisation,
			},
			responseInit,
		)
	} catch (error) {
		return handleLoaderError(error)
	}
}

export default function Index() {
	const { organisation, dailyTotals } = useLoaderData<typeof loader>()
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
				{dailyTotals && (
					<Grid container spacing={4}>
						<Grid item md={4} xs={12}>
							<Summary
								amount={dailyTotals.newLeads}
								diff={0}
								icon={ListChecksIcon}
								title="New Leads"
								trend="up"
							/>
						</Grid>
						<Grid item md={4} xs={12}>
							<Summary
								amount={dailyTotals.newUsers}
								diff={0}
								icon={ListChecksIcon}
								title="New Users"
								trend="up"
							/>
						</Grid>
						<Grid item md={4} xs={12}>
							<Summary
								amount={dailyTotals.newMessages}
								diff={0}
								icon={ListChecksIcon}
								title="New Messages"
								trend="up"
							/>
						</Grid>
						<Grid item md={4} xs={12}>
							<Summary
								amount={dailyTotals.newWhatsappMessages}
								diff={0}
								icon={ListChecksIcon}
								title="New WhatsApp Messages"
								trend="up"
							/>
						</Grid>
						<Grid item md={4} xs={12}>
							<Summary
								amount={dailyTotals.newAudioMessages}
								diff={0}
								icon={ListChecksIcon}
								title="New Audio Messages"
								trend="up"
							/>
						</Grid>
						<Grid item md={4} xs={12}>
							<Summary
								amount={dailyTotals.dailyChats}
								diff={0}
								icon={ListChecksIcon}
								title="Daily Chats"
								trend="up"
							/>
						</Grid>
					</Grid>
				)}
			</Stack>
		</Box>
	)
}
