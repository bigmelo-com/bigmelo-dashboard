import { z } from 'zod'

export const dailyTotalsSchema = z.object({
	newLeads: z.number(),
	newUsers: z.number(),
	newMessages: z.number(),
	newWhatsappMessages: z.number(),
	newAudioMessages: z.number(),
	dailyChats: z.number(),
})

export type DailyTotals = z.infer<typeof dailyTotalsSchema>

export const dailyTotalsApiResponseSchema = z.object({
	data: dailyTotalsSchema,
})

export type DailyTotalsApiResponse = z.infer<
	typeof dailyTotalsApiResponseSchema
>
