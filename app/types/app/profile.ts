import { z } from 'zod'
import {
	EmailSchema,
	NameSchema,
	PhoneNumberSchema,
} from '#app/utils/user-validation.js'

export const ProfileFormSchema = z.object({
	firstName: NameSchema.optional(),
	lastName: NameSchema.optional(),
	phoneNumber: PhoneNumberSchema.readonly(),
	email: EmailSchema.readonly(),
})

export const ProfileResponseSchema = z.object({
	data: z.object({
		firstName: z.nullable(z.string()),
		lastName: z.nullable(z.string()),
		phoneNumber: z.string(),
		email: z.nullable(z.string()),
		role: z.string(),
		remainingMessages: z.string(),
		messageLimit: z.string(),
		usedMessages: z.number(),
	}),
})
