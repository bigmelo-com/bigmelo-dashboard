import { z } from 'zod'

export const dailyTotals = z.object({
	newLeads: z.number(),
	newUsers: z.number(),
	newMessages: z.number(),
	newWhatsappMessages: z.number(),
	newAudioMessages: z.number(),
	dailyChats: z.number(),
})

export type DailyTotals = z.infer<typeof dailyTotals>

export const dailyTotalsResponse = z.object({
	data: dailyTotals,
})

export type DailyTotalsResponse = z.infer<typeof dailyTotalsResponse>
