import { useLocation } from '@remix-run/react'

export function usePathname(): string {
	const location = useLocation()

	return location.pathname
}
