import NextLink, { LinkProps as NextLinkProps } from 'next/link'
import React from 'react'

import MuiLink from '@mui/material/Link'

type NextLinkComposedProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  Omit<NextLinkProps, 'href' | 'onClick' | 'onMouseEnter'> & { to: NextLinkProps['href'] }

export const NextLinkComposed = React.forwardRef<HTMLAnchorElement, NextLinkComposedProps>(
  ({ to, style, ...other }, ref) => <NextLink href={to} style={{ ...style, outline: 'none' }} {...other} ref={ref} />
)
NextLinkComposed.displayName = 'NextLinkComposed'

// TODO does this work also?
// type NextLinkComposedProps2 = {
//   myRef: React.Ref<HTMLAnchorElement>
// } & Omit<NextLinkComposedProps, 'href'>
// function NextLinkComposed2({ myRef, to, style, ...other }: NextLinkComposedProps2) {
//   return <NextLink href={to} style={{ ...style, outline: 'none' }} {...other} ref={myRef} />
// }

type LinkProps = { href: NextLinkProps['href'] } & Omit<NextLinkComposedProps, 'to'>

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({ href, ...other }, ref) => {
  return <MuiLink component={NextLinkComposed} ref={ref} to={href} {...other} />
})
Link.displayName = 'Link'

// TODO does this work also?
// type Link2Props = { myRef: React.Ref<HTMLAnchorElement> } & LinkProps
// function Link2({ myRef, href, ...other }: Link2Props) {
//   return <MuiLink component={NextLinkComposed} ref={myRef} to={href} {...other} />
// }

export default Link
