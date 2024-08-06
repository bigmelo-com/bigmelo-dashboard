import { Box, Stack, Typography } from '@mui/material'

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
			<Stack
				direction={{ xs: 'column', md: 'row' }}
				spacing={4}
				sx={{ position: 'relative' }}
			>
				<Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
					<Typography>Create Organisation</Typography>
				</Box>
			</Stack>
		</Box>
	)
}
