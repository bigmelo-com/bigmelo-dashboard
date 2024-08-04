import { Box } from '@mui/material'
const HEIGHT = 60
const WIDTH = 60

export interface LogoProps {
	emblem?: boolean
	height?: number
	width?: number
}

export function Logo({
	emblem,
	height = HEIGHT,
	width = WIDTH,
}: LogoProps): React.JSX.Element {
	return (
		<Box
			alt="logo"
			component="img"
			height={height}
			src={emblem ? '/assets/logo-emblem.svg' : '/assets/logo.svg'}
			width={width}
		/>
	)
}
