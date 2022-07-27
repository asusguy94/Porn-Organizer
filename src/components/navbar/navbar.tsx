import { FC } from 'react'

import { Link } from '@mui/material'

import RouterLink from '@components/router-link/router-link'

import './navbar.scss'

import { server as serverConfig } from '@/config'

const NavBar = () => (
	<nav>
		<ul className='main-menu'>
			<NavBarItem name='Home' path='/' />

			<NavBarItem name='Video Search' path='/video/search' />

			<NavBarItem name='Star Search' path='/star/search'>
				<NavBarItem name='Stars' path='/star' />
			</NavBarItem>

			<NavBarItem name='DB' path={serverConfig.db} remote={true} />
			<NavBarItem name='Import Videos' path='/video/add' />
			<NavBarItem name='DB Editor' path='/editor' />
		</ul>
	</nav>
)

interface NavBarItemProps {
	name: string
	path: string
	disabled?: boolean
	remote?: boolean
}
const NavBarItem: FC<NavBarItemProps> = ({ name, path, children, disabled = false, remote = false }) => {
	if (!disabled) {
		return (
			<li>
				{!remote ? (
					<Link component={RouterLink} href={path}>
						{name}
					</Link>
				) : (
					<Link href={path}>{name}</Link>
				)}
				{children ? <ul className='sub-menu'>{children}</ul> : null}
			</li>
		)
	}

	return null
}

export default NavBar
