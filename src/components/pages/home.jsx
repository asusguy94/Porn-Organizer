import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'

import config from '../config'

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
            <div>
                {this.printData(this.state.recent)}
                {this.printData(this.state.newest)}
                {this.printData(this.state.random)}
                {this.printData(this.state.popular)}
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
        Axios.get(`${config.api}/home.php?type=${type}&limit=${limit}`).then(
            ({ data }) => {
                this.setState((prevState) => {
                    let object = { ...prevState[type] }
                    object.data = data

                    return { [type]: object }
                })
            }
        )
    }

    printData(obj) {
        if (obj.enabled) {
            return (
                <div className='col-12'>
                    <h2>
                        {obj.label} Videos (
                        <span className='count'>{obj.limit}</span>)
                    </h2>
                    <div className='row'>
                        {Object.keys(obj.data).map((key, i) => (
                            <Link
                                className='video col-1 px-0 mx-3 ribbon-container'
                                key={i}
                                to={`/video/${obj.data[key].id}`}
                            >
                                <img
                                    className='mx-auto img-thumbnail'
                                    alt='video'
                                    src={`${config.source}/images/videos/${obj.data[key].id}-290`}
                                />
                                <span className='mx-auto d-block text-center'>
                                    {obj.data[key].name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )
        }
    }
}

export default HomePage
