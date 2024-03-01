import NextTopLoader from 'nextjs-toploader'

import ClientLayout from './client-layout'
import NonSSRLayout from './nonssr-layout'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <title>Porn</title>
      </head>

      <body>
        <NextTopLoader />
        <NonSSRLayout>
          <ClientLayout>{children}</ClientLayout>
        </NonSSRLayout>
      </body>
    </html>
  )
}
