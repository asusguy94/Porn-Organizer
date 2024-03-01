import dynamic from 'next/dynamic'

type LayoutWithChildren = {
  children: React.ReactNode
}

const NonSSRComponent = ({ children }: LayoutWithChildren) => <>{children}</>
const NonSSRLayout = dynamic(() => Promise.resolve(NonSSRComponent), { ssr: false })

export default NonSSRLayout
