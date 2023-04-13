/* eslint-disable react/display-name */
import React from 'react'
import { useRouter } from 'next/router'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'

import MuiLink, { LinkProps as MuiLinkProps } from '@mui/material/Link'

import clsx from 'clsx'

type NextLinkComposedProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
  Omit<NextLinkProps, 'href' | 'onClick' | 'onMouseEnter'> & {
    to: NextLinkProps['href']
  }

export const NextLinkComposed = React.forwardRef<HTMLAnchorElement, NextLinkComposedProps>(
  ({ to, style, ...other }, ref) => (
    <NextLink href={to} passHref style={{ ...style, outline: 'none' }} {...other} ref={ref} />
  )
)

export type LinkProps = {
  activeClassName?: string
  as?: NextLinkProps['as']
  href: NextLinkProps['href']
  linkAs?: NextLinkProps['as']
  noLinkStyle?: boolean
} & Omit<NextLinkComposedProps, 'to' | 'linkAs' | 'href'> &
  Omit<MuiLinkProps, 'href'>

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      activeClassName = 'active',
      className: classNameProps,
      href,
      locale,
      noLinkStyle,
      prefetch,
      replace,
      scroll,
      shallow,
      ...other
    },
    ref
  ) => {
    const router = useRouter()
    const pathname = typeof href === 'string' ? href : href.pathname
    const className = clsx(classNameProps, {
      [activeClassName]: router.pathname === pathname && activeClassName
    })

    const isExternal = typeof href === 'string' && (href.startsWith('http') || href.startsWith('mailto:'))

    if (isExternal) {
      return <MuiLink className={className} href={href} ref={ref} {...other} />
    }

    const nextjsProps = {
      to: href,
      replace,
      scroll,
      shallow,
      prefetch,
      locale
    }

    if (noLinkStyle) {
      return <NextLinkComposed className={className} ref={ref} {...nextjsProps} {...other} />
    }

    return <MuiLink component={NextLinkComposed} className={className} ref={ref} {...nextjsProps} {...other} />
  }
)

export default Link
