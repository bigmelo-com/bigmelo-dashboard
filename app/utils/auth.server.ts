import { type Password, type User } from '@prisma/client'
import { redirect } from '@remix-run/node'
import bcrypt from 'bcryptjs'
import { safeRedirect } from 'remix-utils/safe-redirect'
import { type LoginRequest, LoginResponseSchema } from '#app/types/app/login.js'
import { post } from './api.ts'

import { prisma } from './db.server.ts'
import { isSuccessResponse } from './isSuccessResponse.ts'
import { combineHeaders } from './misc.tsx'
import { getAuthHeader } from './server/getAuthHeader.ts'
import { authSessionStorage } from './session.server.ts'
import { validate } from './validate.ts'
import { verifyZodSchema } from './verifyZodSchema.ts'

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30
export const getSessionExpirationDate = () =>
	new Date(Date.now() + SESSION_EXPIRATION_TIME)

export const sessionKey = 'sessionId'

export async function getSessionData(request: Request) {
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const sessionId = authSession.get(sessionKey)
	if (!sessionId) return null
	const session = await prisma.session.findUnique({
		select: { user: { select: { id: true } }, accessToken: true },
		where: { id: sessionId, expirationDate: { gt: new Date() } },
	})
	if (!session?.user) {
		throw redirect('/', {
			headers: {
				'set-cookie': await authSessionStorage.destroySession(authSession),
			},
		})
	}
	return { userId: session.user.id, accessToken: session.accessToken }
}

export async function requireAuthedSession(
	request: Request,
	{ redirectTo }: { redirectTo?: string | null } = {},
) {
	const sessionData = await getSessionData(request)
	if (!sessionData?.userId) {
		const requestUrl = new URL(request.url)
		redirectTo =
			redirectTo === null
				? null
				: redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`
		const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null
		const loginRedirect = ['/login', loginParams?.toString()]
			.filter(Boolean)
			.join('?')
		throw redirect(loginRedirect)
	}
	return {
		userId: sessionData.userId,
		authHeader: getAuthHeader(sessionData.accessToken),
	}
}

export async function requireAnonymous(request: Request) {
	const userId = await getSessionData(request)
	if (userId) {
		throw redirect('/')
	}
}

export async function login({
	email,
	password,
}: {
	email: User['email']
	password: string
}) {
	const user = await verifyUserPassword({ email }, password)
	if (!user) return null
	const session = await prisma.session.create({
		select: { id: true, expirationDate: true, userId: true },
		data: {
			expirationDate: getSessionExpirationDate(),
			userId: user.id,
			accessToken: user.accessToken,
		},
	})
	return session
}

export async function resetUserPassword({
	username,
	password,
}: {
	username: User['username']
	password: string
}) {
	const hashedPassword = await getPasswordHash(password)
	return prisma.user.update({
		where: { username },
		data: {
			password: {
				update: {
					hash: hashedPassword,
				},
			},
		},
	})
}

export async function signup({
	email,
	username,
	password,
	name,
}: {
	email: User['email']
	username: User['username']
	name: User['name']
	password: string
}) {
	const hashedPassword = await getPasswordHash(password)

	const session = await prisma.session.create({
		data: {
			expirationDate: getSessionExpirationDate(),
			user: {
				create: {
					email: email.toLowerCase(),
					username: username.toLowerCase(),
					name,
					roles: { connect: { name: 'user' } },
					password: {
						create: {
							hash: hashedPassword,
						},
					},
				},
			},
			accessToken: await bcrypt.hash(username, 10), // TODO use a real token
		},
		select: { id: true, expirationDate: true },
	})

	return session
}

export async function logout(
	{
		request,
		redirectTo = '/',
	}: {
		request: Request
		redirectTo?: string
	},
	responseInit?: ResponseInit,
) {
	const authSession = await authSessionStorage.getSession(
		request.headers.get('cookie'),
	)
	const sessionId = authSession.get(sessionKey)
	// if this fails, we still need to delete the session from the user's browser
	// and it doesn't do any harm staying in the db anyway.
	if (sessionId) {
		// the .catch is important because that's what triggers the query.
		// learn more about PrismaPromise: https://www.prisma.io/docs/orm/reference/prisma-client-reference#prismapromise-behavior
		void prisma.session.deleteMany({ where: { id: sessionId } }).catch(() => {})
	}
	throw redirect(safeRedirect(redirectTo), {
		...responseInit,
		headers: combineHeaders(
			{ 'set-cookie': await authSessionStorage.destroySession(authSession) },
			responseInit?.headers,
		),
	})
}

export async function getPasswordHash(password: string) {
	const hash = await bcrypt.hash(password, 10)
	return hash
}

export async function verifyUserPassword(
	where: Pick<User, 'email'>,
	password: Password['hash'],
) {
	const requestBody: LoginRequest = {
		email: where.email,
		password,
	}

	const response = await post('/v1/auth/get-token', requestBody)

	validate(
		isSuccessResponse(response),
		"We're having trouble logging you in. Please try again.",
	)

	const data = verifyZodSchema(
		response.data,
		LoginResponseSchema,
		'There was an error logging you in. Please try again.',
	)

	let user

	try {
		user = await prisma.user.findUniqueOrThrow({
			where,
			select: { id: true },
		})
	} catch (error) {
		console.error(error)
		user = await prisma.user.create({
			data: {
				email: where.email,
				username: where.email,
				password: {
					create: {
						hash: password,
					},
				},
			},
			select: { id: true },
		})
	}

	return { id: user.id, accessToken: data.accessToken }
}
