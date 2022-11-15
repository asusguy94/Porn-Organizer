import Head from 'next/head'
import type { AppProps } from 'next/app'

import { Container, CssBaseline } from '@mui/material'

import NavBar from '@components/navbar'

import '@styles/globals.scss'
import 'plyr/dist/plyr.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Porn</title>
      </Head>

      <CssBaseline />

      <NavBar />
      <Container component='main' maxWidth={false}>
        <Component {...pageProps} />
      </Container>
    </>
  )
}

export default MyApp
