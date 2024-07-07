import { Box, GlobalStyles } from '@mui/material'
import { type MetaFunction } from '@remix-run/node'
import { Outlet } from '@remix-run/react'
import { Fragment } from 'react'
import { layoutConfig } from '#app/components/dashboard/layout/config.js'
import { MainNav } from '#app/components/dashboard/layout/main-nav.js'
import { SideNav } from '#app/components/dashboard/layout/side-nav.js'
import { EpicProgress } from '#app/components/progress-bar.js'
import { EpicToaster } from '#app/components/ui/sonner.js'

export const meta: MetaFunction = () => [{ title: 'Dashboard' }]

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