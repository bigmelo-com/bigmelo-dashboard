import { z } from 'zod'
import { EmailSchema } from '#app/utils/user-validation.js'

export const ProfileResponseSchema = z.object({
	data: z.object({
		firstName: z.nullable(z.string()),
		lastName: z.nullable(z.string()),
		phoneNumber: z.string(),
		email: EmailSchema,
		role: z.string(),
		remainingMessages: z.string(),
		messageLimit: z.string(),
		usedMessages: z.number(),
	}),
})
