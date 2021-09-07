import { FC } from 'react'
import { Link } from 'react-router-dom'

import './navbar.scss'

import { server as serverConfig } from '@/config'

const NavBar = () => (
	<nav>
		<ul className='main-menu'>
			<NavBarItem name='Home' path='/' />

			<NavBarItem name='Video Search' path='/video/search'>
				<NavBarItem name='Videos' path='/video' />
			</NavBarItem>

			<NavBarItem name='Star Search' path='/star/search'>
				<NavBarItem name='Stars' path='/star' />
			</NavBarItem>

			<NavBarItem name='DB Editor' path='/editor' />

			<NavBarItem name='DB' path={serverConfig.db} remote={true} />
			<NavBarItem name='Import Videos' path='/video/add' />
		</ul>
	</nav>
)

interface INavBarItem {
	name: string
	path: string
	disabled?: boolean
	remote?: boolean
}
const NavBarItem: FC<INavBarItem> = ({ name, path, children, disabled = false, remote = false }) => {
	if (!disabled) {
		return (
			<li>
				{!remote ? <Link to={path}>{name}</Link> : <a href={path}>{name}</a>}
				{children ? <ul className='sub-menu'>{children}</ul> : null}
			</li>
		)
	}

	return null
}

export default NavBar
