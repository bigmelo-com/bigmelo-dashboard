import { ProfileResponseSchema } from '#app/types/app/profile.js'
import { get } from '../api'
import { prisma } from '../db.server'
import { isSuccessResponse } from '../isSuccessResponse'
import { time, type Timings } from '../timing.server'
import { validate } from '../validate'
import { verifyZodSchema } from '../verifyZodSchema'
import { getAuthHeader } from './getAuthHeader'

type SessionData = {
	userId: string
	accessToken: string
} | null

export async function getProfile(
	sessionData: SessionData,
	options?: { timings?: Timings },
) {
	return sessionData?.userId
		? await time(
				async () => {
					const remixUser = await prisma.user.findUniqueOrThrow({
						select: {
							id: true,
							image: { select: { id: true } },
							roles: {
								select: {
									name: true,
									permissions: {
										select: { entity: true, action: true, access: true },
									},
								},
							},
						},
						where: { id: sessionData?.userId },
					})

					const response = await get('/v1/profile', {
						headers: getAuthHeader(sessionData?.accessToken),
					})

					validate(
						isSuccessResponse(response),
						"We're having trouble logging you in. Please try again.",
					)

					const { data } = verifyZodSchema(
						response.data,
						ProfileResponseSchema,
						'There was an error logging you in. Please try again.',
					)
					return { ...remixUser, ...data }
				},
				{
					timings: options?.timings,
					type: 'find user',
					desc: 'find user in root',
				},
			)
		: null
}
