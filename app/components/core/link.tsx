import { Link, type LinkProps } from '@remix-run/react'
import { forwardRef } from 'react'

interface RouterLinkProps extends Omit<LinkProps, 'to'> {
	href: string
}

export const RouterLink = forwardRef(function RouterLink(
	props: RouterLinkProps,
	ref: React.Ref<HTMLAnchorElement>,
) {
	const { href, ...other } = props

	return <Link ref={ref} to={href} {...other} />
})
