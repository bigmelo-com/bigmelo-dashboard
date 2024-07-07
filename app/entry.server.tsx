import { CacheProvider } from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type HandleDocumentRequestFunction,
} from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import * as Sentry from '@sentry/remix'
import chalk from 'chalk'
import * as ReactDOMServer from 'react-dom/server'
import { ThemeProvider } from './styles/theme/components/core/theme-provider.tsx'
import createEmotionCache from './styles/theme/createEmotionCache.ts'
import { getEnv, init } from './utils/env.server.ts'
import { getInstanceInfo } from './utils/litefs.server.ts'
import { NonceProvider } from './utils/nonce-provider.ts'

init()
global.ENV = getEnv()

if (ENV.MODE === 'production' && ENV.SENTRY_DSN) {
	import('./utils/monitoring.server.ts').then(({ init }) => init())
}

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>

export default async function handleRequest(...args: DocRequestArgs) {
	const [
		request,
		responseStatusCode,
		responseHeaders,
		remixContext,
		loadContext,
	] = args
	const { currentInstance, primaryInstance } = await getInstanceInfo()
	const cache = createEmotionCache()
	const { extractCriticalToChunks } = createEmotionServer(cache)

	responseHeaders.set('fly-region', process.env.FLY_REGION ?? 'unknown')
	responseHeaders.set('fly-app', process.env.FLY_APP_NAME ?? 'unknown')
	responseHeaders.set('fly-primary-instance', primaryInstance)
	responseHeaders.set('fly-instance', currentInstance)
	const nonce = String(loadContext.cspNonce) ?? undefined

	function MuiRemixServer() {
		return (
			<NonceProvider value={nonce}>
				<CacheProvider value={cache}>
					<ThemeProvider>
						<RemixServer context={remixContext} url={request.url} />
					</ThemeProvider>
				</CacheProvider>
			</NonceProvider>
		)
	}

	// Render the component to a string.
	const html = ReactDOMServer.renderToString(<MuiRemixServer />)

	// Grab the CSS from emotion
	const { styles } = extractCriticalToChunks(html)

	let stylesHTML = ''

	styles.forEach(({ key, ids, css }) => {
		const emotionKey = `${key} ${ids.join(' ')}`
		const newStyleTag = `<style data-emotion="${emotionKey}">${css}</style>`
		stylesHTML = `${stylesHTML}${newStyleTag}`
	})

	// Add the Emotion style tags after the insertion point meta tag
	const markup = html.replace(
		/<meta(\s)*name="emotion-insertion-point"(\s)*content="emotion-insertion-point"(\s)*\/>/,
		`<meta name="emotion-insertion-point" content="emotion-insertion-point"/>${stylesHTML}`,
	)

	responseHeaders.set('Content-Type', 'text/html')

	return new Response(`<!DOCTYPE html>${markup}`, {
		status: responseStatusCode,
		headers: responseHeaders,
	})
}

export async function handleDataRequest(response: Response) {
	const { currentInstance, primaryInstance } = await getInstanceInfo()
	response.headers.set('fly-region', process.env.FLY_REGION ?? 'unknown')
	response.headers.set('fly-app', process.env.FLY_APP_NAME ?? 'unknown')
	response.headers.set('fly-primary-instance', primaryInstance)
	response.headers.set('fly-instance', currentInstance)

	return response
}

export function handleError(
	error: unknown,
	{ request }: LoaderFunctionArgs | ActionFunctionArgs,
): void {
	// Skip capturing if the request is aborted as Remix docs suggest
	// Ref: https://remix.run/docs/en/main/file-conventions/entry.server#handleerror
	if (request.signal.aborted) {
		return
	}
	if (error instanceof Error) {
		console.error(chalk.red(error.stack))
		Sentry.captureRemixServerException(error, 'remix.server', request)
	} else {
		console.error(chalk.red(error))
		Sentry.captureException(error)
	}
}
