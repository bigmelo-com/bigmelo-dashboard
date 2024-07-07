import { Box, GlobalStyles } from '@mui/material'
import { useLoaderData } from '@remix-run/react'
import { Fragment } from 'react'
import { layoutConfig } from '#app/components/dashboard/layout/config.js'
import { SideNav } from '#app/components/dashboard/layout/side-nav.js'
import { EpicProgress } from '#app/components/progress-bar.js'
// import { SearchBar } from '#app/components/search-bar.js'
import { useToast } from '#app/components/toaster.js'

import { EpicToaster } from '#app/components/ui/sonner.js'
import { type loader } from '#app/root.js'

// import { useOptionalUser } from '#app/utils/user.js'
import { MainNav } from './main-nav'

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const data = useLoaderData<typeof loader>()
	// const user = useOptionalUser()
	// const matches = useMatches()
	// const isOnSearchPage = matches.find(m => m.id === 'routes/users+/index')
	// const searchBar = isOnSearchPage ? null : <SearchBar status="idle" />

	useToast(data.toast)
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
					{/* <header className="py-6">
						<nav className="flex items-center justify-between gap-4 md:gap-8">
							<div className="ml-auto hidden max-w-sm flex-1 sm:block">
								{searchBar}
							</div>
							<div className="flex items-center gap-10">
								{user ? (
									<UserDropdown />
								) : (
									<Button variant="contained">
										<Link to="/login">Log In</Link>
									</Button>
								)}
							</div>
							<div className="block w-full sm:hidden">{searchBar}</div>
						</nav>
					</header> */}

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
						{children}
					</Box>
					<EpicToaster closeButton position="top-center" theme="system" />
					<EpicProgress />
				</Box>
			</Box>
		</Fragment>
	)
}
