import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'

import {
	Avatar,
	Box,
	Card,
	CardContent,
	CardHeader,
	Stack,
	Typography,
} from '@mui/material'
import { type SEOHandle } from '@nasa-gcn/remix-seo'
import { Camera as CameraIcon } from '@phosphor-icons/react/dist/ssr/Camera'
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { Link, useFetcher, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { ErrorList, Field } from '#app/components/forms.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { ProfileFormSchema } from '#app/types/app/profile.js'
import { requireAuthedSession } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { getUserImgSrc } from '#app/utils/misc.tsx'
import { getProfile } from '#app/utils/server/profile.js'

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
									<Link
										preventScrollReset
										to="photo"
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
									</Link>
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
			<div className="grid grid-cols-6 gap-x-10">
				{/* <Field
					className="col-span-3"
					labelProps={{
						htmlFor: fields.email.id,
						children: 'Email',
					}}
					inputProps={getInputProps(fields.email, { type: 'text' })}
					errors={fields.email.errors}
				/>
				<Field
					className="col-span-3"
					labelProps={{
						htmlFor: fields.phoneNumber.id,
						children: 'Phone number',
					}}
					inputProps={getInputProps(fields.phoneNumber, { type: 'text' })}
					errors={fields.phoneNumber.errors}
				/> */}
				<Field
					className="col-span-3"
					labelProps={{ htmlFor: fields.firstName.id, children: 'First name' }}
					inputProps={getInputProps(fields.firstName, { type: 'text' })}
					errors={fields.firstName.errors}
				/>
				<Field
					className="col-span-3"
					labelProps={{ htmlFor: fields.lastName.id, children: 'Last name' }}
					inputProps={getInputProps(fields.lastName, { type: 'text' })}
					errors={fields.lastName.errors}
				/>
			</div>

			<ErrorList errors={form.errors} id={form.errorId} />

			<div className="mt-8 flex justify-center">
				<StatusButton
					type="submit"
					size="wide"
					name="intent"
					value={profileUpdateActionIntent}
					status={fetcher.state !== 'idle' ? 'pending' : form.status ?? 'idle'}
				>
					Save changes
				</StatusButton>
			</div>
		</fetcher.Form>
	)
}
