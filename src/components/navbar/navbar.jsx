import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import './navbar.scss'

import config from '../config'

class NavBar extends Component {
    render() {
        return (
            <nav>
                <ul className='main-menu'>
                    <li>
                        <Link to='/'>Home</Link>
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
                        <ul className='sub-menu'>
                            <li>
                                <a href={`${config.source}/stars.php`} target='_blank' rel='noopener noreferrer'>
                                    Stars
                                </a>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <Link to='/settings' className='d-none'>
                            Settings
                        </Link>
                    </li>

                    <li>
                        <Link to='/editor'>DB Editor</Link>
                    </li>

                    <li>
                        <a href={`${config.db}/phpMyAdmin`} target='_blank' rel='noopener noreferrer'>
                            DB
                        </a>
                    </li>

                    <li>
                        <a href={`${config.source}/video_generatethumbnails.php`} target='_blank' rel='noopener noreferrer'>
                            Import Videos
                        </a>

                        <ul className='sub-menu'>
                            <li>
                                <a href={`${config.source}/vtt.php`} target='_blank' rel='noopener noreferrer'>
                                    Build Previews
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
        )
    }
}

export default NavBar
