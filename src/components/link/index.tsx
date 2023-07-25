import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import React from 'react'

import MuiLink from '@mui/material/Link'

type NextLinkComposedProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  Omit<NextLinkProps, 'href' | 'onClick' | 'onMouseEnter'> & { to: NextLinkProps['href'] }

// eslint-disable-next-line react/display-name
export const NextLinkComposed = React.forwardRef<HTMLAnchorElement, NextLinkComposedProps>(
  ({ to, style, ...other }, ref) => <NextLink href={to} style={{ ...style, outline: 'none' }} {...other} ref={ref} />
)

type LinkProps = { href: NextLinkProps['href'] } & Omit<NextLinkComposedProps, 'to'>

// eslint-disable-next-line react/display-name
const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({ href, ...other }, ref) => {
  return <MuiLink component={NextLinkComposed} ref={ref} to={href} {...other} />
})

export default Link
