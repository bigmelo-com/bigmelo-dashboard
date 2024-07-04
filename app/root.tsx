import { withEmotionCache } from '@emotion/react'
import { unstable_useEnhancedEffect as useEnhancedEffect } from '@mui/material'
import {
	json,
	type LoaderFunctionArgs,
	type HeadersFunction,
	type LinksFunction,
	type MetaFunction,
} from '@remix-run/node'
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react'
import { withSentry } from '@sentry/remix'
import { useContext, useRef } from 'react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import { GeneralErrorBoundary } from './components/error-boundary.tsx'
import { useToast } from './components/toaster.tsx'
import { href as iconsHref } from './components/ui/icon.tsx'
import { SettingsProvider } from './contexts/settings.tsx'
import { applyDefaultSettings } from './lib/settings/apply-default-settings.ts'
import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import ClientStyleContext from './styles/theme/ClientStyleContext.tsx'
import Layout from './styles/theme/Layout.tsx'
import theme from './styles/theme/theme.ts'
import { getSessionData, logout } from './utils/auth.server.ts'
import { ClientHintCheck, getHints } from './utils/client-hints.tsx'
import { prisma } from './utils/db.server.ts'
import { getEnv } from './utils/env.server.ts'
import { honeypot } from './utils/honeypot.server.ts'
import { combineHeaders, getDomainUrl } from './utils/misc.tsx'
import { useNonce } from './utils/nonce-provider.ts'
import { getTheme } from './utils/theme.server.ts'
import { makeTimings, time } from './utils/timing.server.ts'
import { getToast } from './utils/toast.server.ts'

export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		{ rel: 'preload', href: iconsHref, as: 'image' },
		// Preload CSS as a resource to avoid render blocking
		{ rel: 'mask-icon', href: '/favicons/mask-icon.svg' },
		{
			rel: 'alternate icon',
			type: 'image/png',
			href: '/favicons/favicon-32x32.png',
		},
		{ rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
		{
			rel: 'manifest',
			href: '/site.webmanifest',
			crossOrigin: 'use-credentials',
		} as const, // necessary to make typescript happy
		//These should match the css preloads above to avoid css as render blocking resource
		{ rel: 'icon', type: 'image/svg+xml', href: '/favicons/favicon.svg' },
		{ rel: 'stylesheet', href: tailwindStyleSheetUrl },
	].filter(Boolean)
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data ? 'Bigmelo' : 'Error | Bigmelo' },
		{ name: 'description', content: `Your own captain's log` },
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const timings = makeTimings('root loader')
	const sessionData = await time(() => getSessionData(request), {
		timings,
		type: 'getUserId',
		desc: 'getUserId in root',
	})

	const user = sessionData?.userId
		? await time(
				() =>
					prisma.user.findUniqueOrThrow({
						select: {
							id: true,
							name: true,
							username: true,
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
						where: { id: sessionData.userId },
					}),
				{ timings, type: 'find user', desc: 'find user in root' },
			)
		: null
	if (sessionData?.userId && !user) {
		console.info('something weird happened')
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await logout({ request, redirectTo: '/' })
	}
	const { toast, headers: toastHeaders } = await getToast(request)
	const honeyProps = honeypot.getInputProps()

	return json(
		{
			user,
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				userPrefs: {
					theme: getTheme(request),
				},
			},
			ENV: getEnv(),
			toast,
			honeyProps,
		},
		{
			headers: combineHeaders(
				{ 'Server-Timing': timings.toString() },
				toastHeaders,
			),
		},
	)
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const headers = {
		'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
	}
	return headers
}

type DocumentProps = {
	children: React.ReactNode
	nonce: string
	env?: Record<string, string>
	allowIndexing?: boolean
}

const Document = withEmotionCache(
	(
		{ children, nonce, env = {}, allowIndexing = true }: DocumentProps,
		emotionCache,
	) => {
		const clientStyleData = useContext(ClientStyleContext)

		// Only executed on client
		useEnhancedEffect(() => {
			// re-link sheet container
			emotionCache.sheet.container = document.head
			// re-inject tags
			const tags = emotionCache.sheet.tags
			emotionCache.sheet.flush()
			tags.forEach(tag => {
				;(emotionCache.sheet as any)._insertTag(tag)
			})
			// reset cache to reapply global styles
			clientStyleData.reset()
		}, [])

		return (
			<html lang="en" className={`${theme} h-full overflow-x-hidden`}>
				<head>
					<ClientHintCheck nonce={nonce} />
					<Meta />
					<meta charSet="utf-8" />
					<meta name="viewport" content="width=device-width,initial-scale=1" />
					<meta name="theme-color" content={theme.palette.primary.main} />
					{allowIndexing ? null : (
						<meta name="robots" content="noindex, nofollow" />
					)}
					<Links />
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link
						rel="preconnect"
						href="https://fonts.gstatic.com"
						crossOrigin=""
					/>
					<link
						rel="stylesheet"
						href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
					/>
					<meta
						name="emotion-insertion-point"
						content="emotion-insertion-point"
					/>
				</head>
				<body className="bg-background text-foreground">
					{children}
					<script
						nonce={nonce}
						dangerouslySetInnerHTML={{
							__html: `window.ENV = ${JSON.stringify(env)}`,
						}}
					/>
					<ScrollRestoration nonce={nonce} />
					<Scripts nonce={nonce} />
				</body>
			</html>
		)
	},
)

function App() {
	const data = useLoaderData<typeof loader>()
	const nonce = useNonce()
	const allowIndexing = data.ENV.ALLOW_INDEXING !== 'false'
	useToast(data.toast)

	return (
		<Document nonce={nonce} allowIndexing={allowIndexing} env={data.ENV}>
			<Layout>
				<Outlet />
			</Layout>
		</Document>
	)
}

function AppWithProviders() {
	const data = useLoaderData<typeof loader>()
	const settings = useRef(applyDefaultSettings({})) // TODO: get settings from localStorage
	return (
		<HoneypotProvider {...data.honeyProps}>
			<SettingsProvider settings={settings.current}>
				<App />
			</SettingsProvider>
		</HoneypotProvider>
	)
}

export default withSentry(AppWithProviders)

export function ErrorBoundary() {
	// the nonce doesn't rely on the loader so we can access that
	const nonce = useNonce()

	// NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
	// likely failed to run so we have to do the best we can.
	// We could probably do better than this (it's possible the loader did run).
	// This would require a change in Remix.

	// Just make sure your root route never errors out and you'll always be able
	// to give the user a better UX.

	return (
		<Document nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	)
}
