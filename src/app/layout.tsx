import NextTopLoader from 'nextjs-toploader'

import ClientLayout from './client-layout'

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <title>Porn</title>
      </head>

      <body>
        <NextTopLoader />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

export default RootLayout
