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
	FormHelperText,
	InputLabel,
	Link,
	OutlinedInput,
	Stack,
	Typography,
} from '@mui/material'
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft'
import { BuildingOffice as BuildingOfficeIcon } from '@phosphor-icons/react/dist/ssr/BuildingOffice'
import { type ActionFunctionArgs } from '@remix-run/node'
import { Form, json, redirect, useActionData } from '@remix-run/react'
import { z } from 'zod'
import { RouterLink } from '#app/components/core/link.js'
import { paths } from '#app/paths.js'
import {
	createOrganisationResponseSchema,
	type CreateOrganisationRequest,
} from '#app/types/bigmelo/organisations.js'
import { post } from '#app/utils/api.js'
import { requireAuthedSession } from '#app/utils/auth.server.js'
import { isSuccessResponse } from '#app/utils/isSuccessResponse.js'
import { useIsPending } from '#app/utils/misc.js'
import { setCurrentOrganisationId } from '#app/utils/organisations.server.js'
import { validate } from '#app/utils/validate.js'
import { verifyZodSchema } from '#app/utils/verifyZodSchema.js'

const CreateOrganisationSchema = z.object({
	organisationName: z
		.string({
			required_error: 'El nombre de la organización es requerido',
		})
		.min(3, 'El nombre de la organización es muy corto')
		.max(50, 'El nombre de la organización es muy largo'),
	description: z
		.string({ required_error: 'La descripción es requerida' })
		.min(3, 'La descripción es muy corta')
		.max(255, 'La descripción es muy larga'),
})

export async function action({ request }: ActionFunctionArgs) {
	const { authHeader } = await requireAuthedSession(request)
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
		const requestBody: CreateOrganisationRequest = {
			userId: 9, // TODO - USE THE REAL USER ID HERE!
			name: submission.value.organisationName,
			description: submission.value.description,
		}
		const response = await post('/v1/organization', requestBody, {
			headers: {
				...authHeader,
			},
		})

		validate(isSuccessResponse(response), "Couldn't create the organisation")

		const data = verifyZodSchema(
			response.data,
			createOrganisationResponseSchema,
			'There was an error logging you in. Please try again.',
		)

		const responseInit = {
			headers: {
				'set-cookie': setCurrentOrganisationId(data.organisationId),
			},
		}

		return redirect(`/dashboard/${data.organisationId}`, responseInit)
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
									/>
									<FormHelperText>
										{fields.organisationName?.errors?.[0]}
									</FormHelperText>
								</FormControl>

								<FormControl error={Boolean(fields.description?.errors)}>
									<InputLabel htmlFor={fields.description.name}>
										Descripción
									</InputLabel>
									<OutlinedInput
										{...getInputProps(fields.description, { type: 'text' })}
									/>
									<FormHelperText>
										{fields.organisationName?.errors?.[0]}
									</FormHelperText>
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
