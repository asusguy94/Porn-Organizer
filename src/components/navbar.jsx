import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import './styles/navbar.scss'

class NavBar extends Component {
    render() {
        return (
            <nav>
                <ul className='main-menu'>
                    <li>
                        <Link to='/'>Home</Link>
                    </li>

                    <li>
                        <Link to='/videos/add'>Add Videos</Link>
                    </li>

                    <li>
                        <Link to='/videos/search'>Video Search</Link>
                        <ul className='sub-menu'>
                            <li>
                                <Link to='/videos'>Videos</Link>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <Link to='/stars/search'>Star Search</Link>
                        <ul className='sub-menu d-none'>
                            <li>
                                <Link to='/stars'>Stars</Link>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <Link to='/settings'>Settings</Link>
                    </li>

                    <li>
                        <a href='https://ds1517/phpMyAdmin'>DB</a>
                    </li>

                    <li>
                        <Link to='/generate/thumbnails'>
                            Generate Thumbnails
                        </Link>
                        <ul className='sub-menu'>
                            <li>
                                <Link to='/generate/vtt'>Generate WebVTT</Link>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
        )
    }
}

export default NavBar
