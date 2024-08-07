'use client'

import { InputLabel, Stack, Tooltip } from '@mui/material'

import { Info as InfoIcon } from '@phosphor-icons/react/dist/ssr/Info'
import * as React from 'react'

import { Option } from './option'
import { type NavColor } from '@/types/settings'

export interface OptionsNavColorProps {
	onChange?: (value: NavColor) => void
	value?: NavColor
}

export function OptionsNavColor({
	onChange,
	value,
}: OptionsNavColorProps): React.JSX.Element {
	return (
		<Stack spacing={1}>
			<Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
				<InputLabel>Nav color</InputLabel>
				<Tooltip placement="top" title="Dashboard only">
					<InfoIcon
						color="var(--mui-palette-text-secondary)"
						fontSize="var(--icon-fontSize-md)"
						weight="fill"
					/>
				</Tooltip>
			</Stack>
			<Stack
				direction="row"
				spacing={2}
				sx={{ alignItems: 'center', flexWrap: 'wrap' }}
			>
				{(
					[
						{ label: 'Blend-in', value: 'blend_in' },
						{ label: 'Discrete', value: 'discrete' },
						{ label: 'Evident', value: 'evident' },
					] as { label: string; value: NavColor }[]
				).map(option => (
					<Option
						key={option.label}
						label={option.label}
						onClick={() => {
							onChange?.(option.value)
						}}
						selected={option.value === value}
					/>
				))}
			</Stack>
		</Stack>
	)
}
