import * as cookie from 'cookie'
import { type Organisation } from '@/types/bigmelo/organisations.js'

const cookieName = 'current_organisation'

export function getCurrentOrganisationId(
	request: Request,
): Organisation['id'] | null {
	const cookieHeader = request.headers.get('cookie')
	const parsed = cookieHeader
		? parseInt(cookie.parse(cookieHeader)[cookieName] ?? '') || null
		: null
	return parsed
}

export function setCurrentOrganisationId(id: Organisation['id'] | undefined) {
	if (id) {
		return cookie.serialize(cookieName, id.toString(), {
			path: '/',
			maxAge: 31536000,
		})
	} else {
		return cookie.serialize(cookieName, '', { path: '/', maxAge: -1 })
	}
}
