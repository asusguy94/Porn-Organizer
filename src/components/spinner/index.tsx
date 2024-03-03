import styles from './spinner.module.css'

type SpinnerProps = {
  size?: 'small' | 'medium' | 'large'
}

export default function Spinner({ size = 'large' }: SpinnerProps) {
  return <div id={styles.loader} className={styles[size]}></div>
}
