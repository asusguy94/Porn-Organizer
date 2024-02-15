'use client'

import { Roboto } from 'next/font/google'

import { Container, CssBaseline } from '@mui/material'

import { ToastContainer } from 'react-toastify'

import NavBar from '@components/navbar'

import Providers from './providers'

import '@styles/globals.css'
import 'react-toastify/dist/ReactToastify.min.css'

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

      <ToastContainer position='top-center' autoClose={5000} draggable={false} />
    </>
  )
}
