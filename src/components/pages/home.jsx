import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'

import '../styles/home.scss'

import config from '../config'

class HomeColumn extends Component {
    render() {
        const { obj } = this.props

        if (obj.enabled) {
            return (
                <section className='col-12'>
                    <h2>
                        {obj.label} Videos (<span className='count'>{obj.limit}</span>)
                    </h2>

                    <div className='row'>
                        {Object.keys(obj.data).map((i) => (
                            <Link className='video col-1 px-0 mx-3 ribbon-container' to={`/video/${obj.data[i].id}`} key={i}>
                                <img
                                    className='mx-auto img-thumbnail'
                                    alt='video'
                                    src={`${config.source}/images/videos/${obj.data[i].id}-290`}
                                />

                                <span className='video__title mx-auto d-block'>{obj.data[i].name}</span>

                                {obj.data[i].plays > 0 && <span className='ribbon'>{obj.data[i].plays}</span>}
                            </Link>
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
            label: 'Recent',
            enabled: true,
            limit: 10,
            data: [],
        },
        newest: {
            label: 'Newest',
            enabled: true,
            limit: 10,
            data: [],
        },
        popular: {
            label: 'Popular',
            enabled: true,
            limit: 20,
            data: [],
        },
        random: {
            label: 'Random',
            enabled: false,
            limit: 20,
            data: [],
        },
    }

    render() {
        return (
            <div className='home-page'>
                <HomeColumn obj={this.state.recent} />
                <HomeColumn obj={this.state.newest} />
                <HomeColumn obj={this.state.random} />
                <HomeColumn obj={this.state.popular} />
            </div>
        )
    }

    componentDidMount() {
        if (this.state.recent.enabled) this.getData('recent')
        if (this.state.newest.enabled) this.getData('newest')
        if (this.state.popular.enabled) this.getData('popular')
        if (this.state.random.enabled) this.getData('random')
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
