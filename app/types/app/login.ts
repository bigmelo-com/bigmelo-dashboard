import { z } from 'zod'
import { EmailSchema, PasswordSchema } from '#app/utils/user-validation.js'

export const LoginFormSchema = z.object({
	email: EmailSchema,
	password: PasswordSchema,
	redirectTo: z.string().optional(),
	remember: z.boolean().optional(),
})

export const LoginRequestSchema = z.object({
	email: EmailSchema,
	password: PasswordSchema,
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const LoginResponseSchema = z.object({
	accessToken: z.string(),
})
