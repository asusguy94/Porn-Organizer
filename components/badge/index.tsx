import styles from './badge.module.scss'

type BadgeProps = {
  content: number
  children: React.ReactNode
}
const Badge = ({ content, children }: BadgeProps) => {
  const badgeClass = content < 10 ? styles.small : styles.large

  return (
    <div className={`${styles.badge} ${badgeClass}`} data-badge={content}>
      {children}
    </div>
  )
}

export default Badge
