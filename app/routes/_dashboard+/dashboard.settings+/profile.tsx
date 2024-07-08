import { invariantResponse } from '@epic-web/invariant'
import { Box, Stack } from '@mui/material'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet } from '@remix-run/react'

import { SettingsSideNav } from '#app/components/settings-side-nav.js'
import { requireAuthedSession } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
	const sessionData = await requireAuthedSession(request)
	const user = await prisma.user.findUnique({
		where: { id: sessionData?.userId },
		select: { username: true },
	})
	invariantResponse(user, 'User not found', { status: 404 })
	return json({})
}

export default function EditUserProfile() {
	return (
		<Box
			sx={{
				maxWidth: 'var(--Content-maxWidth)',
				m: 'var(--Content-margin)',
				p: 'var(--Content-padding)',
				width: 'var(--Content-width)',
			}}
		>
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				spacing={4}
				sx={{ position: 'relative' }}
			>
				<SettingsSideNav />
				<Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
					<Outlet />
				</Box>
			</Stack>
		</Box>
	)
}
