import { Head, Html, Main, NextScript } from 'next/document'

function MyDocument() {
  return (
    <Html lang='en'>
      <Head>
        <link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap' />

        <script async src='https://pro.fontawesome.com/releases/v5.15.4/js/all.js' />
        <script async src='https://pro.fontawesome.com/releases/v5.15.4/js/fontawesome.js' />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default MyDocument
