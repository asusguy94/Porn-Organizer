import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import './styles/navbar.scss'

import config from './config.json'

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
                        <a href={`${config.source}/star_search.php`}>Star Search</a>
                        <ul className='sub-menu'>
                            <li>
                                <a href={`${config.source}/stars.php`}>Stars</a>
                            </li>
                        </ul>
                    </li>

                    <li>
                        <Link to='/settings' className='d-none'>
                            Settings
                        </Link>
                    </li>

                    <li>
                        <a href='https://ds1517/phpMyAdmin'>DB</a>
                    </li>

                    <li>
                        <a href={`${config.source}/video_generatethumbnails.php`}>Generate Thumbnails</a>
                        <ul className='sub-menu'>
                            <li>
                                <a href={`${config.source}/vtt.php`}>Generte WebVTT</a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
        )
    }
}

export default NavBar
