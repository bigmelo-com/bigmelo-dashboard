import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { CheckboxField, ErrorList, Field } from '#app/components/forms.tsx'
import { paths } from '#app/paths.js'
import { LoginFormSchema } from '#app/types/app/login.js'
import { login, requireAnonymous } from '#app/utils/auth.server.ts'
import { checkHoneypot } from '#app/utils/honeypot.server.ts'
import { useIsPending } from '#app/utils/misc.tsx'
import { handleNewSession } from './login.server.ts'
import { SplitLayout } from '@/components/auth/split-layout.js'
import { RouterLink } from '@/components/core/link'
import { DynamicLogo } from '@/components/core/logo'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAnonymous(request)
	return json({})
}

export async function action({ request }: ActionFunctionArgs) {
	await requireAnonymous(request)
	const formData = await request.formData()
	checkHoneypot(formData)
	const submission = await parseWithZod(formData, {
		schema: intent =>
			LoginFormSchema.transform(async (data, ctx) => {
				if (intent !== null) return { ...data, session: null }

				const session = await login(data)
				if (!session) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Invalid email or password',
					})
					return z.NEVER
				}

				return { ...data, session }
			}),
		async: true,
	})

	if (submission.status !== 'success' || !submission.value.session) {
		return json(
			{ result: submission.reply({ hideFields: ['password'] }) },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { session, remember, redirectTo } = submission.value

	return handleNewSession({
		request,
		session,
		remember: remember ?? false,
		redirectTo,
	})
}

export default function LoginPage() {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	const [form, fields] = useForm({
		id: 'login-form',
		constraint: getZodConstraint(LoginFormSchema),
		defaultValue: { redirectTo },
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: LoginFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<SplitLayout>
			<Stack spacing={4}>
				<div>
					<Box
						component={RouterLink}
						href={paths.home}
						sx={{ display: 'inline-block', fontSize: 0 }}
					>
						<DynamicLogo
							colorDark="light"
							colorLight="dark"
							height={32}
							width={122}
						/>
					</Box>
				</div>
				<Stack spacing={1}>
					<Typography variant="h5">Iniciar sesión</Typography>
					<Typography color="text.secondary" variant="body2">
						¿Todavía no tienes cuenta?{' '}
						<Link
							component={RouterLink}
							href={
								redirectTo
									? `/signup?${encodeURIComponent(redirectTo)}`
									: '/signup'
							}
							variant="subtitle2"
						>
							Regístrate
						</Link>
					</Typography>
				</Stack>

				<Stack spacing={2}>
					<Form method="POST" {...getFormProps(form)}>
						<Stack spacing={2}>
							<HoneypotInputs />
							<Field
								labelProps={{ children: 'Email' }}
								inputProps={{
									...getInputProps(fields.email, { type: 'text' }),
									autoFocus: true,
									className: 'lowercase',
									autoComplete: 'email',
								}}
								errors={fields.email.errors}
							/>

							<Field
								labelProps={{ children: 'Password' }}
								inputProps={{
									...getInputProps(fields.password, {
										type: 'password',
									}),
									autoComplete: 'current-password',
								}}
								errors={fields.password.errors}
							/>

							<CheckboxField
								labelProps={{
									htmlFor: fields.remember.id,
									children: 'Remember me',
								}}
								buttonProps={getInputProps(fields.remember, {
									type: 'checkbox',
								})}
								errors={fields.remember.errors}
							/>

							<input
								{...getInputProps(fields.redirectTo, { type: 'hidden' })}
							/>
							<ErrorList errors={form.errors} id={form.errorId} />

							<Button disabled={isPending} type="submit" variant="contained">
								Ingresar
							</Button>
						</Stack>
					</Form>
					{/* <div>
						<Link
							component={RouterLink}
							href="/forgot-password"
							variant="subtitle2"
						>
							Recordar contraseña
						</Link>
					</div> */}
				</Stack>
			</Stack>
		</SplitLayout>
	)
}

export const meta: MetaFunction = () => {
	return [{ title: 'Login to Epic Notes' }]
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
