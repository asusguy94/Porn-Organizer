import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'

import { DaysToYears } from '../date/date'

import config from '../config'

class VideosPage extends Component {
    state = {
        limit: 24,
        data: [],
    }

    render() {
        return (
            <div className='col'>
                <div className='list-group'>
                    {this.state.data.map((video, i) => (
                        <li key={i} className='list-group-item list-group-item-action'>
                            <span className='badge badge-primary badge-pill'>
                                <DaysToYears>{video.age}</DaysToYears>
                            </span>

                            <Link className='col-11' to={`video/${video.id}`}>
                                {video.name}
                            </Link>
                        </li>
                    ))}
                </div>
            </div>
        )
    }

    componentDidMount() {
        this.getData()
    }

    getData(limit = this.state.limit) {
        Axios.get(`${config.api}/videos.php?limit=${limit}`).then(({ data }) => this.setState({ data }))
    }
}

export default VideosPage
