import { Box, Stack } from '@mui/material'
import { redirect, type MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => [{ title: 'Bigmelo' }]

export async function loader() {
	// Redirect to the dashboard while we build out the marketing content
	return redirect('/dashboard')
}

export default function Index() {
	return (
		<Box
			sx={{
				maxWidth: 'var(--Content-maxWidth)',
				m: 'var(--Content-margin)',
				p: 'var(--Content-padding)',
				width: 'var(--Content-width)',
			}}
		>
			<Stack spacing={4}>Add Marketing Content Here</Stack>
		</Box>
	)
}
