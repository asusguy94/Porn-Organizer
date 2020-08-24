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
            label: 'Recent Added',
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
            label: 'Most Popular',
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
            <div id='home-page'>
                {Object.keys(this.state).map((item, i) => (
                    <HomeColumn obj={this.state[item]} key={i} />
                ))}
            </div>
        )
    }

    componentDidMount() {
        Object.keys(this.state).forEach((item) => {
            if (this.state[item].enabled) this.getData(item)
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
