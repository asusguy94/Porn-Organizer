import styles from './badge.module.scss'

interface IBadge {
  content: number
  children: React.ReactNode
}
const Badge = ({ content, children }: IBadge) => {
  const badgeClass = content < 10 ? styles.small : styles.large

  return (
    <div className={`${styles.badge} ${badgeClass}`} data-badge={content}>
      {children}
    </div>
  )
}

export default Badge
