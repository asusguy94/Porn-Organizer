import styles from './ribbon.module.scss'

type RibbonProps = {
  isFirst?: boolean
  isLast?: boolean
  align?: string
  label?: string | number
}
export default function Ribbon({ isFirst = false, isLast = false, align, label }: RibbonProps) {
  const className = `${styles.ribbon} ${align === 'left' ? `${styles.left} ${styles.purple}` : ''}`

  if (isFirst) {
    return <span className={className}>First</span>
  } else if (isLast) {
    return <span className={className}>Latest</span>
  } else if (label !== undefined) {
    return <span className={className}>{label}</span>
  }

  return null
}

type ContainerProps = {
  children: React.ReactNode
  component?: React.ElementType
  className?: string
  style?: React.CSSProperties
}
export function RibbonContainer({
  children,
  component: Component = 'div',
  className = '',
  style = {}
}: ContainerProps) {
  return (
    <Component className={`${styles.container} ${className}`} style={style}>
      {children}
    </Component>
  )
}
