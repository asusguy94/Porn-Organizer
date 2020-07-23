import React, { Component } from 'react'

import Axios from 'axios'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'

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
    constructor(props) {
        super(props)
        this.state = {
        input: {
            id: '',
                value: props.value,
        },
    }

        this.update = this.props.update
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
            let { id, value } = this.state.input
            if (id.length && value.length) {
                this.update(id, value)
            }
        }
    }

    handleLabelClass() {
        let serverValue = (this.props.value || '').toLowerCase()
        let clientValue = (this.state.input.value || '').toLowerCase()

        if (clientValue !== serverValue) {
            return 'bold'
        } else {
            return ''
        }
    }

    render() {
        // FIXME input not updating on empty field

        return (
            <div className='input-wrapper'>
                <label className={this.handleLabelClass()} htmlFor={this.props.name.toLowerCase()}>
                    {this.props.name}
                </label>

                <input
                    type={this.props.type}
                    id={this.props.name.toLowerCase()}
                    defaultValue={this.props.value}
                    onChange={(e) => this.updateValue(e)}
                    onKeyDown={(e) => this.keyPress(e)}
                    list={`${this.props.name.toLowerCase()}s`}
                />

                {this.props.list && (
                    <datalist id={`${this.props.name.toLowerCase()}s`}>
                        {this.props.list.map((item, i) => (
                            <option key={i} value={item} />
                        ))}
                    </datalist>
                )}

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
        const { data, starData } = this.props

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

                <StarFormInput update={this.update} name='Breast' value={data.breast} list={starData.breast} />
                <StarFormInput update={this.update} name='EyeColor' value={data.eyecolor} list={starData.eyecolor} />
                <StarFormInput update={this.update} name='HairColor' value={data.haircolor} list={starData.haircolor} />
                <StarFormInput update={this.update} name='Ethnicity' value={data.ethnicity} list={starData.ethnicity} />
                <StarFormInput update={this.update} name='Country' value={data.country.name} list={starData.country}>
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
        starData: {
            breast: [],
            eyecolor: [],
            haircolor: [],
            ethnicity: [],
            country: [],
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

    handleStar_rename() {
        console.log('open modal with input form')
        //console.log(`rename "${this.state.star.name}" to "${name}"`)
    }

    handleStar_remove() {
        console.log(`remove star WHERE starID=${this.state.star.id}`)
        // TODO remove star
    }

    handleStar_removeImage() {
        console.log(`remove image WHERE starID=${this.state.star.id}`)
        // TODO remove starImage
    }

    render() {
        return (
            <div className='star-page col-7'>
                {this.state.loaded.star && (
                    <div className='star'>
                        <img className='star__image' src={`${config.source}/images/stars/${this.state.star.image}`} alt='star' />
                        <h2>{this.state.star.name}</h2>
                        </ContextMenuTrigger>

                        <ContextMenu id='title'>
                            <MenuItem disabled onClick={(e) => this.handleStar_rename(e)}>
                                <i className='far fa-edit' /> Rename
                            </MenuItem>

                            <MenuItem disabled>
                                <i className='far fa-plus' /> Add Alias
                            </MenuItem>

                            <MenuItem disabled>
                                <i className='far fa-ban' /> Ignore Star
                            </MenuItem>

                            <MenuItem divider />

                            <MenuItem disabled>
                                <i className='far fa-copy' /> Copy Star
                            </MenuItem>
                        </ContextMenu>

                        <StarForm
                            update={(label, value) => this.handleStar_updateInfo(label, value)}
                            data={this.state.star.info}
                            starData={this.state.starData}
                        />
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

        Axios.get(`${config.api}/stardata.php`)
            .then(({ data: starData }) => {
                this.setState({ starData })
            })
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.starData = true

                    return { loaded }
                })
            })
    }
}

export default Star
