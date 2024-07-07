import { Link, type LinkProps } from '@remix-run/react'
import * as React from 'react'

interface RouterLinkProps extends Omit<LinkProps, 'to'> {
	href: string
}

export const RouterLink = React.forwardRef(function RouterLink(
	props: RouterLinkProps,
	ref: React.Ref<HTMLAnchorElement>,
) {
	const { href, ...other } = props

	return <Link ref={ref} to={href} {...other} />
})
