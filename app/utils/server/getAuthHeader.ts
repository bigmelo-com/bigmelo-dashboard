import { type AuthHeader } from '#app/types/app/authHeader.js'

export function getAuthHeader(accessToken: string): AuthHeader {
	return {
		Authorization: `Bearer ${accessToken}`,
	}
}
