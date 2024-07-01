import {
	type LoaderFunctionArgs,
	json,
	type MetaFunction,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { dailyTotalsApiResponseSchema } from '#app/types/bigmelo/dailyTotals.js'
import { get } from '#app/utils/api.js'
import { requireAuthedSession } from '#app/utils/auth.server.js'
import handleLoaderError from '#app/utils/server/handleLoaderError.js'
import { verifyZodSchema } from '#app/utils/verifyZodSchema.js'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

export async function loader({ request }: LoaderFunctionArgs) {
	const { authHeader } = await requireAuthedSession(request)
	try {
		const dailyTotalsResponse = await get('/v1/admin-dashboard/daily-totals', {
			headers: {
				...authHeader,
			},
		})

		const dailyTotals = verifyZodSchema(
			dailyTotalsResponse.data,
			dailyTotalsApiResponseSchema,
		)

		return json({
			dailyTotals: dailyTotals.data,
		})
	} catch (error) {
		return handleLoaderError(error)
	}
}

export default function Index() {
	const data = useLoaderData<typeof loader>()
	return (
		<main className="font-poppins grid h-full place-items-center">
			<div className="grid place-items-center px-4 py-16 xl:grid-cols-2 xl:gap-24">
				<div className="flex max-w-md flex-col items-center text-center xl:order-2 xl:items-start xl:text-left">
					<h1
						data-heading
						className="mt-8 animate-slide-top text-4xl font-medium text-foreground [animation-delay:0.3s] [animation-fill-mode:backwards] md:text-5xl xl:mt-4 xl:animate-slide-left xl:text-6xl xl:[animation-delay:0.8s] xl:[animation-fill-mode:backwards]"
					>
						Daily Totals
					</h1>
					<p
						data-paragraph
						className="mt-6 animate-slide-top text-xl/7 text-muted-foreground [animation-delay:0.8s] [animation-fill-mode:backwards] xl:mt-8 xl:animate-slide-left xl:text-xl/6 xl:leading-10 xl:[animation-delay:1s] xl:[animation-fill-mode:backwards]"
					></p>
					{data?.dailyTotals && (
						<div className="">
							<div className="font-semibold text-foreground">
								New Leads: {data?.dailyTotals.newLeads}
							</div>
							<div className="font-semibold text-foreground">
								New Users: {data?.dailyTotals.newUsers}
							</div>
							<div className="font-semibold text-foreground">
								New Messages: {data?.dailyTotals.newMessages}
							</div>
							<div className="font-semibold text-foreground">
								New WhatsApp Messages: {data?.dailyTotals.newWhatsappMessages}
							</div>
							<div className="font-semibold text-foreground">
								New Audio Messages: {data?.dailyTotals.newAudioMessages}
							</div>
							<div className="font-semibold text-foreground">
								Daily Chats: {data?.dailyTotals.dailyChats}
							</div>
						</div>
					)}
				</div>
			</div>
		</main>
	)
}
