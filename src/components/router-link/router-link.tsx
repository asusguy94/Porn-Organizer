import { forwardRef } from 'react'
import { Link, LinkProps } from 'react-router-dom'

const RouterLink = forwardRef<any, Omit<LinkProps, 'to'> & { href: LinkProps['to'] }>((props, ref) => {
	const { href, ...other } = props

	return <Link ref={ref} to={href} {...other} />
})

export default RouterLink
