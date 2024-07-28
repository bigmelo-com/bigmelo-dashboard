import { z } from 'zod'

const ApiResponseSchema = z.object({
	status: z.number(),
	statusText: z.string(),
	data: z.unknown().nullable(),
})

export const linksResponseSchema = z.object({
	first: z.string().nullable(),
	last: z.string().nullable(),
	prev: z.string().nullable(),
	next: z.string().nullable(),
})

export const metaResponseSchema = z.object({
	currentPage: z.number(),
	from: z.number(),
	lastPage: z.number(),
	links: z.array(
		z.object({
			url: z.string().nullable(),
			label: z.string(),
			active: z.boolean(),
		}),
	),
})

export type ApiResponse = z.infer<typeof ApiResponseSchema>
