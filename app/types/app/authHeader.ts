import { z } from 'zod'

export const AuthHeader = z.object({
	Authorization: z.string().startsWith('Bearer '),
})

export type AuthHeader = z.infer<typeof AuthHeader>
