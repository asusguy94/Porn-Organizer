import Ribbon, { RibbonContainer } from './ribbon'

type RetiredWrapperProps = {
  retired: boolean
  children: React.ReactNode
}

export default function RetiredWrapper({ retired, children }: RetiredWrapperProps) {
  return (
    <RibbonContainer>
      {children}
      {retired && <Ribbon label='Retired' />}
    </RibbonContainer>
  )
}
