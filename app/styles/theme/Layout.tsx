import { Box, Button, GlobalStyles } from '@mui/material'
import {
	Form,
	Link,
	useLoaderData,
	useMatches,
	useSubmit,
} from '@remix-run/react'
import { Fragment, useRef } from 'react'
import { layoutConfig } from '#app/components/dashboard/layout/config.js'
import { SideNav } from '#app/components/dashboard/layout/side-nav.js'
import { EpicProgress } from '#app/components/progress-bar.js'
import { SearchBar } from '#app/components/search-bar.js'
import { useToast } from '#app/components/toaster.js'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from '#app/components/ui/dropdown-menu.js'
import { Icon } from '#app/components/ui/icon.js'
import { EpicToaster } from '#app/components/ui/sonner.js'
import { type loader } from '#app/root.js'
import { getUserImgSrc } from '#app/utils/misc.js'
import { useOptionalUser, useUser } from '#app/utils/user.js'

// import Copyright from './Copyright'
// import ProTip from './ProTip'

export default function Layout({ children }: { children: React.ReactNode }) {
	const data = useLoaderData<typeof loader>()
	const user = useOptionalUser()
	const matches = useMatches()
	const isOnSearchPage = matches.find(m => m.id === 'routes/users+/index')
	const searchBar = isOnSearchPage ? null : <SearchBar status="idle" />

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
				<SideNav color="evident" items={layoutConfig.navItems} />
				<Box
					sx={{
						display: 'flex',
						flex: '1 1 auto',
						flexDirection: 'column',
						pl: { lg: 'var(--SideNav-width)' },
					}}
				>
					{/* <MainNav items={layoutConfig.navItems} /> */}
					<header className="py-6">
						<nav className="flex items-center justify-between gap-4 md:gap-8">
							<Logo />
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
					</header>

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

					{/* <div className="container flex justify-between pb-5">
						<Logo />
						TODO: Fix switcher
						<ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
					</div> */}

					<EpicToaster closeButton position="top-center" theme="system" />
					<EpicProgress />
				</Box>
			</Box>
		</Fragment>
	)
}

function Logo() {
	return (
		<Link to="/" className="group grid leading-snug">
			<span className="font-light transition group-hover:-translate-x-1">
				Bigmelo
			</span>
			<span className="font-bold transition group-hover:translate-x-1">
				Dashboard
			</span>
		</Link>
	)
}

function UserDropdown() {
	const user = useUser()
	const submit = useSubmit()
	const formRef = useRef<HTMLFormElement>(null)
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="contained">
					<Link
						to={`/users/${user.username}`}
						// this is for progressive enhancement
						onClick={e => e.preventDefault()}
						className="flex items-center gap-2"
					>
						<img
							className="h-8 w-8 rounded-full object-cover"
							alt={user.name ?? user.username}
							src={getUserImgSrc(user.image?.id)}
						/>
						<span className="text-body-sm font-bold">
							{user.name ?? user.username}
						</span>
					</Link>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent sideOffset={8} align="start">
					<DropdownMenuItem asChild>
						<Link prefetch="intent" to={`/users/${user.username}`}>
							<Icon className="text-body-md" name="avatar">
								Profile
							</Icon>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link prefetch="intent" to={`/users/${user.username}/notes`}>
							<Icon className="text-body-md" name="pencil-2">
								Notes
							</Icon>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						asChild
						// this prevents the menu from closing before the form submission is completed
						onSelect={event => {
							event.preventDefault()
							submit(formRef.current)
						}}
					>
						<Form action="/logout" method="POST" ref={formRef}>
							<Icon className="text-body-md" name="exit">
								<button type="submit">Logout</button>
							</Icon>
						</Form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	)
}
