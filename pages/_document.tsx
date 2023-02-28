import { Head, Html, Main, NextScript } from 'next/document'
import Script from 'next/script'

function MyDocument() {
  return (
    <Html lang='en'>
      <Head />

      <body>
        <Main />
        <NextScript />

        <Script async src='https://pro.fontawesome.com/releases/v5.15.4/js/all.js' strategy='beforeInteractive' />
        <Script
          async
          src='https://pro.fontawesome.com/releases/v5.15.4/js/fontawesome.js'
          strategy='beforeInteractive'
        />
      </body>
    </Html>
  )
}

export default MyDocument
