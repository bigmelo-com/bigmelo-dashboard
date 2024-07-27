import { Box, Button, Grid, Stack, Typography } from '@mui/material'
import { ListChecks as ListChecksIcon } from '@phosphor-icons/react/dist/ssr/ListChecks'
import {
	type LoaderFunctionArgs,
	json,
	type MetaFunction,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Summary } from '#app/components/dashboard/overview/summary.js'
import { dailyTotalsApiResponseSchema } from '#app/types/bigmelo/dailyTotals.js'
import { get } from '#app/utils/api.js'
import { requireAuthedSession } from '#app/utils/auth.server.js'
import handleLoaderError from '#app/utils/server/handleLoaderError.js'
import { verifyZodSchema } from '#app/utils/verifyZodSchema.js'

export const meta: MetaFunction = () => [{ title: 'Bigmelo' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const { authHeader } = await requireAuthedSession(request)
	try {
		const dailyTotalsResponse = await get('/v1/admin-dashboard/daily-totals', {
			headers: {
				...authHeader,
			},
		})

		const dailyTotals = verifyZodSchema(
			dailyTotalsResponse.data,
			dailyTotalsApiResponseSchema,
		)

		return json({
			dailyTotals: dailyTotals.data,
		})
	} catch (error) {
		return handleLoaderError(error)
	}
}

export default function Index() {
	const data = useLoaderData<typeof loader>()
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
						<Typography variant="h4">Daily Totals</Typography>
					</Box>
					<div>
						<Button
							// startIcon={<PlusIcon />}
							variant="contained"
						>
							Dashboard
						</Button>
					</div>
				</Stack>
				{data?.dailyTotals && (
					<Grid container spacing={4}>
						<Grid item md={4} xs={12}>
							<Summary
								amount={data?.dailyTotals.newLeads}
								diff={0}
								icon={ListChecksIcon}
								title="New Leads"
								trend="up"
							/>
						</Grid>
						<Grid item md={4} xs={12}>
							<Summary
								amount={data?.dailyTotals.newUsers}
								diff={0}
								icon={ListChecksIcon}
								title="New Users"
								trend="up"
							/>
						</Grid>
						<Grid item md={4} xs={12}>
							<Summary
								amount={data?.dailyTotals.newMessages}
								diff={0}
								icon={ListChecksIcon}
								title="New Messages"
								trend="up"
							/>
						</Grid>
						<Grid item md={4} xs={12}>
							<Summary
								amount={data?.dailyTotals.newWhatsappMessages}
								diff={0}
								icon={ListChecksIcon}
								title="New WhatsApp Messages"
								trend="up"
							/>
						</Grid>
						<Grid item md={4} xs={12}>
							<Summary
								amount={data?.dailyTotals.newAudioMessages}
								diff={0}
								icon={ListChecksIcon}
								title="New Audio Messages"
								trend="up"
							/>
						</Grid>
						<Grid item md={4} xs={12}>
							<Summary
								amount={data?.dailyTotals.dailyChats}
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
