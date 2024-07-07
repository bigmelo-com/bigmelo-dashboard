import { CacheProvider } from '@emotion/react'

import { RemixBrowser } from '@remix-run/react'
import * as React from 'react'
import { startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import ClientStyleContext from './styles/theme/ClientStyleContext.tsx'
import { ThemeProvider } from './styles/theme/components/core/theme-provider.tsx'
import createEmotionCache from './styles/theme/createEmotionCache.ts'

if (ENV.MODE === 'production' && ENV.SENTRY_DSN) {
	import('./utils/monitoring.client.tsx').then(({ init }) => init())
}

interface ClientCacheProviderProps {
	children: React.ReactNode
}

function ClientCacheProvider({ children }: ClientCacheProviderProps) {
	const [cache, setCache] = React.useState(createEmotionCache())

	const clientStyleContextValue = React.useMemo(
		() => ({
			reset() {
				setCache(createEmotionCache())
			},
		}),
		[],
	)

	return (
		<ClientStyleContext.Provider value={clientStyleContextValue}>
			<CacheProvider value={cache}>{children}</CacheProvider>
		</ClientStyleContext.Provider>
	)
}

startTransition(() => {
	hydrateRoot(
		document,
		<ClientCacheProvider>
			<ThemeProvider>
				<RemixBrowser />
			</ThemeProvider>
		</ClientCacheProvider>,
	)
})
