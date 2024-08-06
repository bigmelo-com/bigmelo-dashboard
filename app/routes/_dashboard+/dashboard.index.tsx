import {
	redirect,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import { getCurrentOrganisationId } from '#app/utils/organisations.server.js'

export const meta: MetaFunction = () => [{ title: 'Bigmelo' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const currentOrganisationId = getCurrentOrganisationId(request)

	if (currentOrganisationId) {
		return redirect(`/dashboard/${currentOrganisationId}`)
	} else {
		// TODO - Redirect to create organisation page
		return redirect('/logout')
	}
}
