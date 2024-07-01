import { redirect, type LoaderFunctionArgs } from '@remix-run/node'
import { requireAuthedSession, logout } from '#app/utils/auth.server.ts'
import { prisma } from '#app/utils/db.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	const sessionData = await requireAuthedSession(request)
	const user = await prisma.user.findUnique({
		where: { id: sessionData?.userId },
	})
	if (!user) {
		const requestUrl = new URL(request.url)
		const loginParams = new URLSearchParams([
			['redirectTo', `${requestUrl.pathname}${requestUrl.search}`],
		])
		const redirectTo = `/login?${loginParams}`
		await logout({ request, redirectTo })
		return redirect(redirectTo)
	}
	return redirect(`/users/${user.username}`)
}
