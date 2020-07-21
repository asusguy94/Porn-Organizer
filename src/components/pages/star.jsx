import React, { Component } from 'react'

import Axios from 'axios'

import Modal from '../modal'

import '../styles/star.scss'

import config from '../config'

class StarVideos extends Component {
    render() {
        const { videos } = this.props

        return (
            <div id='videos' className='row'>
                {Object.keys(videos).map((key, i) => (
                    <a key={i} className='video card' href={`/video/${videos[i].id}`}>
                        <img alt='video' className='card-img-top' src={`${config.source}/images/videos/${videos[i].id}-290`} />

                        <video
                            className='card-img-top d-none'
                            src={`${config.source}/videos/${videos[i].fname}`}
                            poster={`${config.source}/images/videos/${videos[i].id}-290`}
                            preload='metadata'
                            muted
                        />

                        <span className='title card-title mx-auto'>{videos[i].name}</span>
                    </a>
                ))}
            </div>
        )
    }
}

class Star extends Component {
    state = {
        star: {
            id: 0,
            name: '',
            image: '',
        },
        videos: [
            {
                id: 0,
                name: '',
                fname: '',
            },
        ],
        loaded: {
            star: false,
            videos: false,
        },
        modal: {
            visible: false,
            data: null,
        },
        inputValue: '',
    }

    handleModal(title = null, data = null) {
        this.setState((prevState) => {
            let modal = prevState.modal
            modal.title = title
            modal.data = data
            modal.visible = !modal.visible

            return { modal }
        })
    }

    render() {
        return (
            <div className='star-page col-7'>
                {this.state.loaded.star && (
                    <div className='star'>
                        <img className='star__image' src={`${config.source}/images/stars/${this.state.star.image}`} alt='star' />
                        <h2>{this.state.star.name}</h2>
                    </div>
                )}

                <h3>Videos</h3>
                {this.state.loaded.videos && <StarVideos videos={this.state.videos} />}

                <Modal visible={this.state.modal.visible} onClose={() => this.handleModal()} title={this.state.modal.title}>
                    {this.state.modal.data}
                </Modal>
            </div>
        )
    }

    componentDidMount() {
        this.getData()
    }

    getData() {
        let { id } = this.props.match.params

        Axios.get(`${config.api}/star.php?id=${id}`)
            .then(({ data: star }) => this.setState({ star }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.star = true

                    return { loaded }
                })
            })

        Axios.get(`${config.api}/videos.php?starID=${id}`)
            .then(({ data: videos }) => {
                this.setState({ videos })
            })
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.videos = true

                    return { loaded }
                })
            })
    }
}

export default Star
