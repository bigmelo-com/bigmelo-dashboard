import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { redirect } from '@remix-run/react'
import { organisationsApiResponseSchema } from '#app/types/bigmelo/organisations.js'
import { get } from '#app/utils/api.js'
import { requireAuthedSession } from '#app/utils/auth.server.js'
import handleLoaderError from '#app/utils/server/handleLoaderError.js'
import { verifyZodSchema } from '#app/utils/verifyZodSchema.js'

export const meta: MetaFunction = () => [{ title: 'Bigmelo' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const { authHeader } = await requireAuthedSession(request)

	try {
		const organisationsResponse = await get('/v1/organization', {
			headers: {
				...authHeader,
			},
		})

		const verifiedOrganisations = verifyZodSchema(
			organisationsResponse.data,
			organisationsApiResponseSchema,
		)

		if (verifiedOrganisations.data.length > 0) {
			return redirect(`/dashboard/${verifiedOrganisations.data[0]?.id}`)
		} else {
			// TODO - Redirect to create organisation page
			return redirect(`/logout`)
		}
	} catch (error) {
		return handleLoaderError(error)
	}
}
