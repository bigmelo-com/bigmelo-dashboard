import { Avatar, Box, Stack, Typography } from '@mui/material'
import { type Icon } from '@phosphor-icons/react/dist/lib/types'
import { UserCircle as UserCircleIcon } from '@phosphor-icons/react/dist/ssr/UserCircle'

import { getUserImgSrc } from '#app/utils/misc.js'
import { useUser } from '#app/utils/user.js'
import { RouterLink } from '@/components/core/link'
import { usePathname } from '@/hooks/use-pathname'
import { isNavItemActive } from '@/lib/is-nav-item-active'
import { paths } from '@/paths'
import { type NavItemConfig } from '@/types/nav'

// NOTE: First level elements are groups.

const navItems = [
	{
		key: 'personal',
		title: 'Personal',
		items: [
			{
				key: 'profile',
				title: 'Profile',
				href: paths.dashboard.settings.profile,
				icon: 'user-circle',
			},
		],
	},
] satisfies NavItemConfig[]

const icons = {
	'user-circle': UserCircleIcon,
} as Record<string, Icon>

export function SettingsSideNav(): React.JSX.Element {
	const pathname = usePathname()
	const user = useUser()

	return (
		<div>
			<Stack
				spacing={3}
				sx={{
					flex: '0 0 auto',
					flexDirection: { xs: 'column-reverse', md: 'column' },
					position: { md: 'sticky' },
					top: '64px',
					width: { xs: '100%', md: '240px' },
				}}
			>
				<Stack
					component="ul"
					spacing={3}
					sx={{ listStyle: 'none', m: 0, p: 0 }}
				>
					{navItems.map(group => (
						<Stack component="li" key={group.key} spacing={2}>
							{group.title ? (
								<div>
									<Typography color="text.secondary" variant="caption">
										{group.title}
									</Typography>
								</div>
							) : null}
							<Stack
								component="ul"
								spacing={1}
								sx={{ listStyle: 'none', m: 0, p: 0 }}
							>
								{group.items.map(item => (
									<NavItem {...item} key={item.key} pathname={pathname} />
								))}
							</Stack>
						</Stack>
					))}
				</Stack>
				<Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
					<Avatar src={getUserImgSrc(user?.image?.id)} />
					<div>
						<Typography variant="subtitle1">
							{user.firstName} {user.lastName}
						</Typography>
						<Typography color="text.secondary" variant="caption">
							{user.email}
						</Typography>
					</div>
				</Stack>
			</Stack>
		</div>
	)
}

interface NavItemProps extends NavItemConfig {
	pathname: string
}

function NavItem({
	disabled,
	external,
	href,
	icon,
	pathname,
	title,
}: NavItemProps): React.JSX.Element {
	const active = isNavItemActive({ disabled, external, href, pathname })
	const Icon = icon ? icons[icon] : null

	return (
		<Box component="li" sx={{ userSelect: 'none' }}>
			<Box
				{...(href
					? {
							component: external ? 'a' : RouterLink,
							href,
							target: external ? '_blank' : undefined,
							rel: external ? 'noreferrer' : undefined,
						}
					: { role: 'button' })}
				sx={{
					alignItems: 'center',
					borderRadius: 1,
					color: 'var(--mui-palette-text-secondary)',
					cursor: 'pointer',
					display: 'flex',
					flex: '0 0 auto',
					gap: 1,
					p: '6px 16px',
					textDecoration: 'none',
					whiteSpace: 'nowrap',
					...(disabled && {
						color: 'var(--mui-palette-text-disabled)',
						cursor: 'not-allowed',
					}),
					...(active && {
						bgcolor: 'var(--mui-palette-action-selected)',
						color: 'var(--mui-palette-text-primary)',
					}),
					'&:hover': {
						...(!active &&
							!disabled && {
								bgcolor: 'var(--mui-palette-action-hover)',
								color: 'var(---mui-palette-text-primary)',
							}),
					},
				}}
				tabIndex={0}
			>
				{Icon ? (
					<Box
						sx={{
							alignItems: 'center',
							display: 'flex',
							justifyContent: 'center',
							flex: '0 0 auto',
						}}
					>
						<Icon
							fill={
								active
									? 'var(--mui-palette-text-primary)'
									: 'var(--mui-palette-text-secondary)'
							}
							fontSize="var(--icon-fontSize-md)"
							weight={active ? 'fill' : undefined}
						/>
					</Box>
				) : null}
				<Box sx={{ flex: '1 1 auto' }}>
					<Typography
						component="span"
						sx={{
							color: 'inherit',
							fontSize: '0.875rem',
							fontWeight: 500,
							lineHeight: '28px',
						}}
					>
						{title}
					</Typography>
				</Box>
			</Box>
		</Box>
	)
}
