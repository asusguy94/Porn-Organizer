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

                        <span className='title card-title text-center'>{videos[i].name}</span>
                    </a>
                ))}
            </div>
        )
    }
}

class StarFormInput extends Component {
    state = {
        input: {
            value: '',
            id: '',
        },
    }

    updateValue(e) {
        let inputValue = e.target.value
        let inputID = e.target.id

        this.setState((prevState) => {
            let input = prevState.input
            input.id = inputID
            input.value = inputValue

            return { input }
        })
    }

    keyPress(e) {
        if (e.key === 'Enter') {
            if (this.state.input.id.length && this.state.input.value.length) {
                this.props.update(this.state.input.id, this.state.input.value)
            }
        }
    }

    render() {
        return (
            <div className='input-wrapper'>
                <label htmlFor={this.props.name.toLowerCase()}>{this.props.name}</label>
                <input
                    type={this.props.type}
                    id={this.props.name.toLowerCase()}
                    defaultValue={this.props.value}
                    onChange={(e) => this.updateValue(e)}
                    onKeyDown={(e) => this.keyPress(e)}
                />
                {this.props.children}
            </div>
        )
    }
}

class StarForm extends Component {
    constructor(props) {
        super(props)
        this.update = (label, value) => props.update(label, value)
    }

    render() {
        const { data } = this.props

        return (
            <React.Fragment>
                <div className='action'>
                    <div className='btn btn-primary' id='freeones'>
                        Get Data
                    </div>

                    <div className='btn btn-outline-secondary' id='freeones_rs'>
                        Reset Data
                    </div>
                </div>

                <StarFormInput update={this.update} name='Breast' value={data.breast} />
                <StarFormInput update={this.update} name='EyeColor' value={data.eyecolor} />
                <StarFormInput update={this.update} name='HairColor' value={data.haircolor} />
                <StarFormInput update={this.update} name='HairColor' value={data.ethnicity} />
                <StarFormInput update={this.update} name='Country' value={data.country.name}>
                    <i className={`flag flag-${data.country.code}`} />
                </StarFormInput>
                <StarFormInput update={this.update} name='Birthdate' value={data.birthdate} />
                <StarFormInput update={this.update} name='Height' value={data.height} />
                <StarFormInput update={this.update} name='Weight' value={data.weight} />
                <StarFormInput update={this.update} name='Start' value={data.year.start} />
                <StarFormInput update={this.update} name='End' value={data.year.end} />
            </React.Fragment>
        )
    }
}

class Star extends Component {
    state = {
        star: {
            id: 0,
            name: '',
            image: '',
            info: {
                breast: '',
                eyecolor: '',
                haircolor: '',
                ethnicity: '',
                county: {
                    name: '',
                    code: '',
                },
                birthdate: '',
                height: 0,
                weight: 0,
                year: {
                    start: 0,
                    end: 0,
                },
            },
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

    handleStar_updateInfo(label, value) {
        Axios.get(`${config.api}/changestarinfo.php?starID=${this.state.star.id}&label=${label}&value=${value}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let star = prevState.star
                    star.info[label] = value

                    return { star }
                })
            }
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
