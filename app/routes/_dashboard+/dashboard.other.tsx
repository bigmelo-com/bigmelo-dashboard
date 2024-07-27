import { Box, Stack } from '@mui/material'
import { type MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => [{ title: 'Bigmelo' }]

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
			<Stack spacing={4}>
				<p>Other</p>
			</Stack>
		</Box>
	)
}
