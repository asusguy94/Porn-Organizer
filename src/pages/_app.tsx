import Head from 'next/head'
import { AppProps } from 'next/app'
import { Roboto } from 'next/font/google'

import { Container, CssBaseline } from '@mui/material'

import NavBar from '@components/navbar'
import Spinner from '@components/spinner'

import usePageLoading from '@hooks/usePageLoading'

import '@styles/globals.scss'
import 'plyr/dist/plyr.css'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  subsets: ['latin']
})

function MyApp({ Component, pageProps }: AppProps) {
  const { loading } = usePageLoading()

  return (
    <>
      <Head>
        <title>Porn</title>
      </Head>

      <CssBaseline />

      <NavBar />
      <Container component='main' maxWidth={false} className={roboto.className}>
        {loading ? <Spinner /> : <Component {...pageProps} />}
      </Container>
    </>
  )
}

export default MyApp
