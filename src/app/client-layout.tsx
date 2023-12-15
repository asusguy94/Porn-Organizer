'use client'

import { Roboto } from 'next/font/google'

import { Container, CssBaseline } from '@mui/material'

import NavBar from '@components/navbar'

import Providers from './providers'

import '@styles/globals.css'
import 'plyr/dist/plyr.css'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  subsets: ['latin']
})

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />

      <CssBaseline />
      <Container component='main' maxWidth={false} className={roboto.className}>
        <Providers>{children}</Providers>
      </Container>
    </>
  )
}
