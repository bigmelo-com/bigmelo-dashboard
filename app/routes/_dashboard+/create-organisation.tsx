import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { LoadingButton } from '@mui/lab'
import {
	Avatar,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Container,
	FormControl,
	InputLabel,
	Link,
	OutlinedInput,
	Stack,
	Typography,
} from '@mui/material'
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft'
import { BuildingOffice as BuildingOfficeIcon } from '@phosphor-icons/react/dist/ssr/BuildingOffice'
import { type ActionFunctionArgs } from '@remix-run/node'
import {
	Form,
	json,
	redirect,
	useActionData,
	useFetcher,
} from '@remix-run/react'
import { z } from 'zod'
import { RouterLink } from '#app/components/core/link.js'
import { paths } from '#app/paths.js'
import { useIsPending } from '#app/utils/misc.js'
import { setCurrentOrganisationId } from '#app/utils/organisations.server.js'
// import { requireAuthedSession } from '#app/utils/auth.server.js'

const CreateOrganisationSchema = z.object({
	organisationName: z
		.string({
			required_error: 'El nombre de la organización es requerido',
		})
		.min(3, 'El nombre de la organización es muy corto')
		.max(50, 'El nombre de la organización es muy largo'),
	description: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	// const { authHeader } = await requireAuthedSession(request)
	const formData = await request.formData()
	const submission = await parseWithZod(formData, {
		schema: CreateOrganisationSchema,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	try {
		// const response = await fetch('/v1/organization', {
		// 	method: 'POST',
		// 	headers: {
		// 		...authHeader,
		// 		'Content-Type': 'application/json',
		// 	},
		// 	body: JSON.stringify(submission.value),
		// })
		// invariantResponse(response.ok, 'Failed to create organisation')

		const responseInit = {
			headers: {
				'set-cookie': setCurrentOrganisationId(3),
			},
		}

		return redirect('/dashboard/3', responseInit)
	} catch (error) {
		return json({ result: submission.reply(), error }, { status: 400 })
	}
}

export default function Index() {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()

	const [form, fields] = useForm({
		id: 'create-organisation-form',
		constraint: getZodConstraint(CreateOrganisationSchema),
		lastResult: actionData?.result ?? undefined,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: CreateOrganisationSchema })
		},
	})

	return (
		<Container maxWidth="lg" sx={{ py: '64px' }}>
			<Stack spacing={6}>
				<Stack spacing={3}>
					<div>
						<Link
							color="text.primary"
							component={RouterLink}
							href={paths.dashboard.overview}
							sx={{ alignItems: 'center', display: 'inline-flex', gap: 1 }}
							variant="subtitle2"
						>
							<ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
							Dashboard
						</Link>
					</div>
					<Typography variant="h3">Crear una organización</Typography>
					<Typography color="text.secondary" variant="body2">
						¡Bienvenido! Para comenzar, crea una organización.
					</Typography>
				</Stack>
				<Card>
					<CardHeader
						avatar={
							<Avatar>
								<BuildingOfficeIcon fontSize="var(--Icon-fontSize)" />
							</Avatar>
						}
						title="Nueva organización"
					/>
					<Form method="POST" {...getFormProps(form)}>
						<CardContent>
							<Stack spacing={3}>
								<FormControl error={Boolean(fields.organisationName?.errors)}>
									<InputLabel htmlFor={fields.organisationName.name}>
										Nombre
									</InputLabel>
									<OutlinedInput
										{...getInputProps(fields.organisationName, {
											type: 'text',
										})}
										required
									/>
								</FormControl>

								<FormControl>
									<InputLabel htmlFor={fields.description.name}>
										Descripción
									</InputLabel>
									<OutlinedInput
										{...getInputProps(fields.description, { type: 'text' })}
									/>
								</FormControl>
							</Stack>
							<CardActions sx={{ justifyContent: 'flex-end' }}>
								<LoadingButton
									variant="contained"
									type="submit"
									name="submit"
									loading={isPending}
								>
									Crear
								</LoadingButton>
							</CardActions>
						</CardContent>
					</Form>
				</Card>
			</Stack>
		</Container>
	)
}
