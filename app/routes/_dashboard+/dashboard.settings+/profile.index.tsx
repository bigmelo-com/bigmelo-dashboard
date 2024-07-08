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
import { requireAuthedSession } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { getUserImgSrc } from '#app/utils/misc.tsx'
import { NameSchema, UsernameSchema } from '#app/utils/user-validation.ts'

export const handle: SEOHandle = {
	getSitemapEntries: () => null,
}

const ProfileFormSchema = z.object({
	name: NameSchema.optional(),
	username: UsernameSchema,
})

export async function loader({ request }: LoaderFunctionArgs) {
	const sessionData = await requireAuthedSession(request)
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: sessionData?.userId },
		select: {
			id: true,
			name: true,
			username: true,
			email: true,
			image: {
				select: { id: true },
			},
			_count: {
				select: {
					sessions: {
						where: {
							expirationDate: { gt: new Date() },
						},
					},
				},
			},
		},
	})

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
									src={getUserImgSrc(data.user.image?.id)}
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
	const submission = await parseWithZod(formData, {
		async: true,
		schema: ProfileFormSchema.superRefine(async ({ username }, ctx) => {
			const existingUsername = await prisma.user.findUnique({
				where: { username },
				select: { id: true },
			})
			if (existingUsername && existingUsername.id !== userId) {
				ctx.addIssue({
					path: ['username'],
					code: z.ZodIssueCode.custom,
					message: 'A user already exists with this username',
				})
			}
		}),
	})
	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const data = submission.value

	await prisma.user.update({
		select: { username: true },
		where: { id: userId },
		data: {
			name: data.name,
			username: data.username,
		},
	})

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
			username: data.user.username,
			name: data.user.name,
		},
	})

	return (
		<fetcher.Form method="POST" {...getFormProps(form)}>
			<div className="grid grid-cols-6 gap-x-10">
				<Field
					className="col-span-3"
					labelProps={{
						htmlFor: fields.username.id,
						children: 'Username',
					}}
					inputProps={getInputProps(fields.username, { type: 'text' })}
					errors={fields.username.errors}
				/>
				<Field
					className="col-span-3"
					labelProps={{ htmlFor: fields.name.id, children: 'Name' }}
					inputProps={getInputProps(fields.name, { type: 'text' })}
					errors={fields.name.errors}
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
