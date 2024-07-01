import { z } from 'zod'

const ApiResponseSchema = z.object({
	status: z.number(),
	statusText: z.string(),
	data: z.unknown().nullable(),
})

export type ApiResponse = z.infer<typeof ApiResponseSchema>
