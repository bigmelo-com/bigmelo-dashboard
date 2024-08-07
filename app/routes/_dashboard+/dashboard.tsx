import { Box, GlobalStyles } from '@mui/material'
import {
	json,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Outlet, redirect } from '@remix-run/react'
import { Fragment } from 'react'
import { paths } from '#app/paths.js'
import { organisationsApiResponseSchema } from '#app/types/bigmelo/organisations.js'
import { get } from '#app/utils/api.js'
import { requireAuthedSession } from '#app/utils/auth.server.js'
import { setCurrentOrganisationId } from '#app/utils/organisations.server.js'
import handleLoaderError from '#app/utils/server/handleLoaderError.js'
import { verifyZodSchema } from '#app/utils/verifyZodSchema.js'
import { layoutConfig } from '@/components/dashboard/layout/config.js'
import { MainNav } from '@/components/dashboard/layout/main-nav.js'
import { SideNav } from '@/components/dashboard/layout/side-nav.js'
import { EpicProgress } from '@/components/progress-bar.js'
import { EpicToaster } from '@/components/ui/sonner.js'

export const meta: MetaFunction = () => [{ title: 'Dashboard' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const { authHeader } = await requireAuthedSession(request)

	try {
		const organisationsResponse = await get('/v1/organization', {
			headers: {
				...authHeader,
			},
		})

		if ((organisationsResponse.data as any).data.length === 0) {
			return redirect(paths.createOrganisation)
		}

		const verifiedOrganisations = verifyZodSchema(
			organisationsResponse.data,
			organisationsApiResponseSchema,
			'There is not an organisation associated with your account. Please create one.',
		)

		let responseInit
		if (verifiedOrganisations.data.length > 0) {
			responseInit = {
				headers: {
					'set-cookie': setCurrentOrganisationId(
						verifiedOrganisations.data[0]?.id,
					),
				},
			}
		}

		return json(
			{
				currentOrganisationId: verifiedOrganisations.data[0]?.id,
			},
			responseInit,
		)
	} catch (error) {
		return handleLoaderError(error)
	}
}

export default function Index() {
	return (
		<Fragment>
			<GlobalStyles
				styles={{
					body: {
						'--MainNav-height': '56px',
						'--MainNav-zIndex': 1000,
						'--SideNav-width': '280px',
						'--SideNav-zIndex': 1100,
						'--MobileNav-width': '320px',
						'--MobileNav-zIndex': 1100,
					},
				}}
			/>
			<Box
				sx={{
					bgcolor: 'var(--mui-palette-background-default)',
					display: 'flex',
					flexDirection: 'column',
					position: 'relative',
					minHeight: '100%',
				}}
			>
				<SideNav
					items={layoutConfig.navItems}
					settings={{
						primaryColor: 'neonBlue',
						direction: 'ltr',
						navColor: 'evident',
						layout: 'vertical',
						colorScheme: 'light',
					}}
				/>
				<Box
					sx={{
						display: 'flex',
						flex: '1 1 auto',
						flexDirection: 'column',
						pl: { lg: 'var(--SideNav-width)' },
					}}
				>
					<MainNav items={layoutConfig.navItems} />

					<Box
						component="main"
						sx={{
							'--Content-margin': '0 auto',
							'--Content-maxWidth': 'var(--maxWidth-xl)',
							'--Content-paddingX': '24px',
							'--Content-paddingY': { xs: '24px', lg: '64px' },
							'--Content-padding':
								'var(--Content-paddingY) var(--Content-paddingX)',
							'--Content-width': '100%',
							display: 'flex',
							flex: '1 1 auto',
							flexDirection: 'column',
						}}
					>
						<Outlet />
					</Box>
					<EpicToaster closeButton position="top-center" theme="system" />
					<EpicProgress />
				</Box>
			</Box>
		</Fragment>
	)
}
