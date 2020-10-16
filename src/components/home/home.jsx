import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'

import './home.scss'

import config from '../config'

class HomeColumn extends Component {
    render() {
        const { obj } = this.props

        if (obj.enabled) {
            return (
                <section className='col-12'>
                    <h2>
                        {obj.label} (<span className='count'>{obj.limit}</span>)
                    </h2>

                    <div className='row'>
                        {obj.data.map((video, i) => (
                            <div className='row mx-0 px-2 col-1' key={i}>
                                <Link className='video px-0 col-12 ribbon-container' to={`/video/${video.id}`}>
                                    <img
                                        className='mx-auto img-thumbnail'
                                        alt='video'
                                        src={`${config.source}/images/videos/${video.id}-290`}
                                    />

                                    <span className='video__title mx-auto d-block'>{video.name}</span>

                                    {obj.data[i].plays > 0 && <span className='ribbon'>{video.plays}</span>}
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            )
        }
        return null
    }
}

class HomePage extends Component {
    state = {
        recent: {
            label: 'Recent Added',
            enabled: true,
            limit: 12,
            data: [],
        },
        newest: {
            label: 'Newest',
            enabled: true,
            limit: 12,
            data: [],
        },
        popular: {
            label: 'Most Popular',
            enabled: true,
            limit: 24,
            data: [],
        },
        random: {
            label: 'Random',
            enabled: false,
            limit: 24,
            data: [],
        },
    }

    render() {
        return (
            <div id='home-page'>
                {Object.keys(this.state).map((key, i) => (
                    <HomeColumn obj={this.state[key]} key={i} />
                ))}
            </div>
        )
    }

    componentDidMount() {
        Object.keys(this.state).forEach((key) => {
            if (this.state[key].enabled) this.getData(key)
        })
    }

    getData(type, limit = this.state[type].limit) {
        Axios.get(`${config.api}/home.php?type=${type}&limit=${limit}`).then(({ data }) => {
            this.setState((prevState) => {
                let object = prevState[type]
                object.data = data

                return { [type]: object }
            })
        })
    }
}

export default HomePage
