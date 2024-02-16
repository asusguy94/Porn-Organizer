import { Link } from 'react-router-dom'

import styles from './navbar.module.scss'

export default function NavBar() {
  return (
    <nav id={styles.navbar}>
      <ul>
        <NavBarItem name='Home' path='/' />

        <NavBarItem name='Video Search' path='/video/search' />

        <NavBarItem name='Star Search' path='/star/search'>
          <NavBarItem name='Stars' path='/star' />
        </NavBarItem>
      </ul>

      <ul>
        <NavBarItem name='Settings' path='/settings' />
        <NavBarItem name='DB Editor' path='/editor' />
        <NavBarItem name='Import Videos' path='/video/add' />
      </ul>
    </nav>
  )
}

type NavBarItemProps = {
  name: string
  path: string
  disabled?: boolean
  children?: React.ReactNode
}
function NavBarItem({ name, path, children, disabled = false }: NavBarItemProps) {
  if (disabled) return null

  return (
    <li>
      <Link to={path}>{name}</Link>

      {children ? <ul className={styles.sub}>{children}</ul> : null}
    </li>
  )
}
