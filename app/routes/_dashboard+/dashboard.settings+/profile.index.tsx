import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'

import {
	Avatar,
	Box,
	Card,
	CardContent,
	CardHeader,
	FormControl,
	FormHelperText,
	InputAdornment,
	InputLabel,
	OutlinedInput,
	Select,
	Link,
	Stack,
	Typography,
	CardActions,
	Button,
} from '@mui/material'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { Camera as CameraIcon } from '@phosphor-icons/react/dist/ssr/Camera'
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { RouterLink } from '#app/components/core/link.js'
import { ErrorList } from '#app/components/forms.tsx'
import { ProfileFormSchema } from '#app/types/app/profile.js'
import { requireAuthedSession } from '#app/utils/auth.server.ts'
import { getUserImgSrc } from '#app/utils/misc.tsx'
import { getProfile } from '#app/utils/server/profile.js'
import { Option } from '@/components/core/option'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

export async function loader({ request }: LoaderFunctionArgs) {
	const sessionData = await requireAuthedSession(request)
	const user = await getProfile(sessionData, { withSessions: true })

	return json({
		user,
	})
}

type ProfileActionArgs = {
	request: Request
	userId: string
	formData: FormData
}
const profileUpdateActionIntent = 'update-profile'

export async function action({ request }: ActionFunctionArgs) {
	const sessionData = await requireAuthedSession(request)
	const formData = await request.formData()
	const intent = formData.get('intent')
	switch (intent) {
		case profileUpdateActionIntent: {
			return profileUpdateAction({
				request,
				userId: sessionData?.userId,
				formData,
			})
		}

		default: {
			throw new Response(`Invalid intent "${intent}"`, { status: 400 })
		}
	}
}

export default function EditUserProfile() {
	const data = useLoaderData<typeof loader>()

	return (
		<Card>
			<CardHeader
				avatar={
					<Avatar>
						<UserIcon fontSize="var(--Icon-fontSize)" />
					</Avatar>
				}
				title="Basic details"
			/>
			<CardContent>
				<Stack spacing={3}>
					<Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
						<Box
							sx={{
								border: '1px dashed var(--mui-palette-divider)',
								borderRadius: '50%',
								display: 'inline-flex',
								p: '4px',
							}}
						>
							<Box sx={{ borderRadius: 'inherit', position: 'relative' }}>
								<Box
									sx={{
										alignItems: 'center',
										bgcolor: 'rgba(0, 0, 0, 0.5)',
										borderRadius: 'inherit',
										bottom: 0,
										color: 'var(--mui-palette-common-white)',
										cursor: 'pointer',
										display: 'flex',
										justifyContent: 'center',
										left: 0,
										opacity: 0,
										position: 'absolute',
										right: 0,
										top: 0,
										zIndex: 1,
										'&:hover': { opacity: 1 },
									}}
								>
									<RouterLink
										preventScrollReset
										href="/dashboard/settings/profile/photo"
										title="Change profile photo"
										aria-label="Change profile photo"
									>
										<Stack
											direction="row"
											spacing={1}
											sx={{ alignItems: 'center' }}
										>
											<CameraIcon fontSize="var(--icon-fontSize-md)" />
											<Typography color="inherit" variant="subtitle2">
												Select
											</Typography>
										</Stack>
									</RouterLink>
								</Box>
								<Avatar
									src={getUserImgSrc(data.user?.image?.id)}
									sx={{ '--Avatar-size': '100px' }}
								/>
							</Box>
						</Box>
					</Stack>

					<UpdateProfile />
				</Stack>
			</CardContent>
		</Card>
	)
}

async function profileUpdateAction({ userId, formData }: ProfileActionArgs) {
	const submission = parseWithZod(formData, {
		schema: ProfileFormSchema,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const data = submission.value

	console.log('Implement me', data, userId)

	return json({
		result: submission.reply(),
	})
}

function UpdateProfile() {
	const data = useLoaderData<typeof loader>()

	const fetcher = useFetcher<typeof profileUpdateAction>()

	const [form, fields] = useForm({
		id: 'edit-profile',
		constraint: getZodConstraint(ProfileFormSchema),
		lastResult: fetcher.data?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ProfileFormSchema })
		},
		defaultValue: {
			firstName: data.user?.firstName,
			lastName: data.user?.lastName,
		},
	})

	return (
		<fetcher.Form method="POST" {...getFormProps(form)}>
			<ErrorList errors={form.errors} id={form.errorId} />

			<Stack spacing={2}>
				<FormControl disabled>
					<InputLabel>First name</InputLabel>
					<OutlinedInput
						error={Boolean(fields.firstName.errors)}
						{...getInputProps(fields.firstName, { type: 'text' })}
					/>
				</FormControl>
				<FormControl disabled>
					<InputLabel>Last name</InputLabel>
					<OutlinedInput
						error={Boolean(fields.lastName.errors)}
						{...getInputProps(fields.lastName, { type: 'text' })}
					/>
				</FormControl>
				<FormControl disabled>
					<InputLabel>Email address</InputLabel>
					<OutlinedInput name="email" type="email" value={data.user?.email} />
				</FormControl>
				<Stack direction="row" spacing={2}>
					<FormControl sx={{ width: '160px' }} disabled>
						<InputLabel>Dial code</InputLabel>
						<Select
							name="countryCode"
							startAdornment={
								<InputAdornment position="start">
									<Box
										alt="Colombia"
										component="img"
										src="/assets/flags/co.svg"
										sx={{ display: 'block', height: '20px', width: 'auto' }}
									/>
								</InputAdornment>
							}
							value="+57"
						>
							<Option value="+57">Colombia</Option>
						</Select>
					</FormControl>
					<FormControl sx={{ flex: '1 1 auto' }} disabled>
						<InputLabel>Phone number</InputLabel>
						<OutlinedInput defaultValue={data.user?.phoneNumber} name="phone" />
					</FormControl>
				</Stack>
			</Stack>
			<CardActions sx={{ justifyContent: 'flex-end' }}>
				{/* status={fetcher.state !== 'idle' ? 'pending' : form.status ?? 'idle'} */}
				<FormHelperText>
					Please{' '}
					<Link variant="inherit">
						<RouterLink href="/contact" target="_blank">
							contact us
						</RouterLink>
					</Link>{' '}
					to change your mobile number
				</FormHelperText>
				<Button
					variant="contained"
					type="submit"
					name="intent"
					value={profileUpdateActionIntent}
					disabled
				>
					Save changes
				</Button>
			</CardActions>
		</fetcher.Form>
	)
}
