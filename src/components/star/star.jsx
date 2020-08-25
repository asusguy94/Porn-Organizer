import React, { Component } from 'react'

import Axios from 'axios'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'

import Modal, { handleModal } from '../modal/modal'

import './star.scss'

import config from '../config'

class Ribbon extends Component {
    render() {
        const { isFirst, isLast, align, label } = this.props

        let className
        switch (align) {
            case 'left':
                className = 'ribbon ribbon-left ribbon-purple'
                break
            case undefined:
            case 'right':
                className = 'ribbon'
                break
            default:
                return null
        }

        if (isFirst) {
            return <span className={className}>First</span>
        } else if (isLast) {
            return <span className={className}>Latest</span>
        } else {
            if (label) return <span className={className}>{label}</span>
        }

        return null
    }
}

class StarVideo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSrc: `${config.source}/videos/${props.video.fname}`,
            src: '',
        }
    }

    async reloadVideo() {
        this.setState((prevState) => {
            let state = prevState
            state.src = prevState.dataSrc
            state.dataSrc = ''

            return state
        })
    }

    async unloadVideo() {
        this.setState((prevState) => {
            let state = prevState
            state.dataSrc = prevState.src
            state.src = ''

            return state
        })
    }

    playFrom(video, time = 0) {
        if (time) video.currentTime = Number(time)

        video.play()
    }

    stopFrom(video, time) {
        if (time) video.currentTime = Number(time)
        video.pause()
    }

    async startThumbnailPlayback(video) {
        let time = 100
        let offset = 60
        let duration = 1.5

        this.playFrom(video, time)
        this.thumbnail = setInterval(() => {
            time += offset
            if (time > video.duration) {
                this.stopThumbnailPlayback(video)
                this.startThumbnailPlayback(video)
            }
            this.playFrom(video, (time += offset))
        }, duration * 1000)
    }

    async stopThumbnailPlayback(video) {
        this.stopFrom(video)
        clearInterval(this.thumbnail)
    }

    handleMouseEnter(e) {
        const { target } = e

        if (this.state.dataSrc.length && !this.state.src.length) {
            this.reloadVideo().then(() => {
                this.startThumbnailPlayback(target)
            })
        }
    }

    handleMouseLeave(e) {
        const { target } = e

        if (!this.state.dataSrc.length && this.state.src.length) {
            this.stopThumbnailPlayback(target).then(() => {
                this.unloadVideo()
            })
        }
    }

    render() {
        const { video, isFirst, isLast } = this.props

        return (
            <a className='video ribbon-container card' href={`/video/${video.id}`}>
                <video
                    className='card-img-top'
                    src={this.state.src}
                    data-src={this.state.dataSrc}
                    poster={`${config.source}/images/videos/${video.id}-290`}
                    preload='metadata'
                    muted
                    onMouseEnter={this.handleMouseEnter.bind(this)}
                    onMouseLeave={this.handleMouseLeave.bind(this)}
                />

                <span className='title card-title text-center'>{video.name}</span>

                <Ribbon isFirst={isFirst} isLast={isLast} align='left' />

                {video.ageInVideo && <Ribbon label={video.ageInVideo} />}
            </a>
        )
    }
}

class StarVideos extends Component {
    render() {
        const { videos } = this.props

        return (
            <div id='videos' className={this.props.className}>
                {videos.map((item, i) => (
                    <StarVideo
                        video={item}
                        key={i}
                        isFirst={videos.length > 1 && i === 0}
                        isLast={videos.length > 1 && i === videos.length - 1}
                    />
                ))}
            </div>
        )
    }
}

class StarInputForm extends Component {
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
        let { value: inputValue, id: inputID } = e.target

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
            if (id.length) {
                this.update(value, id)
            }
        }
    }

    isChanged() {
        let serverValue = (this.props.value || '').toLowerCase()
        let clientValue = (this.state.input.value || '').toLowerCase()

        return clientValue !== serverValue
    }

    render() {
        return (
            <div className='input-wrapper'>
                <label className={this.isChanged() ? 'bold' : ''} htmlFor={this.props.name.toLowerCase()}>
                    {this.props.name}
                </label>

                <input
                    ref={(input) => (this.input = input)}
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
        this.update = (value, label) => props.update(value, label)
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

                <StarInputForm update={this.update} name='Breast' value={data.breast} list={starData.breast} />
                <StarInputForm update={this.update} name='EyeColor' value={data.eyecolor} list={starData.eyecolor} />
                <StarInputForm update={this.update} name='HairColor' value={data.haircolor} list={starData.haircolor} />
                <StarInputForm update={this.update} name='Ethnicity' value={data.ethnicity} list={starData.ethnicity} />
                <StarInputForm update={this.update} name='Country' value={data.country.name} list={starData.country}>
                    <i className={`flag flag-${data.country.code}`} />
                </StarInputForm>
                <StarInputForm update={this.update} name='Birthdate' value={data.birthdate} />
                <StarInputForm update={this.update} name='Height' value={data.height} />
                <StarInputForm update={this.update} name='Weight' value={data.weight} />
                <StarInputForm update={this.update} name='Start' value={data.start} />
                <StarInputForm update={this.update} name='End' value={data.end} />
            </React.Fragment>
        )
    }
}

class StarImageDropbox extends Component {
    constructor(props) {
        super(props)
        this.removeStar = this.props.removeStar
        this.removeImage = this.props.removeImage
        this.addImage = props.addImage
        this.addImage_local = props.addImage_local
    }

    handleDefault(e) {
        e.stopPropagation()
        e.preventDefault()
    }

    handleDrop(e) {
        this.handleDefault(e)

        let image = e.dataTransfer.getData('text')
        if (this.isLocalFile(image)) {
            image = e.dataTransfer.files
            if (image.length === 1) {
                this.addImage_local(image[0])
            }
        } else {
            this.addImage(image)
        }
    }

    render() {
        const { star } = this.props

        if (star.image !== null) {
            return (
                <React.Fragment>
                    <ContextMenuTrigger id='star__image'>
                        <img className='star__image' src={`${config.source}/images/stars/${star.image}`} alt='star' />
                    </ContextMenuTrigger>

                    <ContextMenu id='star__image'>
                        <MenuItem onClick={this.removeImage}>
                            <i className={`${config.theme.fa} fa-trash-alt`} /> Delete Image
                        </MenuItem>
                    </ContextMenu>
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                    <ContextMenuTrigger id='star__dropbox'>
                        <div
                            id='dropbox'
                            onDragEnter={this.handleDefault.bind(this)}
                            onDragExit={this.handleDefault.bind(this)}
                            onDragOver={this.handleDefault.bind(this)}
                            onDrop={this.handleDrop.bind(this)}
                        >
                            <div className='unselectable label'>Drop Image Here</div>
                        </div>
                    </ContextMenuTrigger>

                    <ContextMenu id='star__dropbox'>
                        <MenuItem onClick={this.removeStar}>
                            <i className={`${config.theme.fa} fa-trash-alt`} /> Remove Star
                        </MenuItem>
                    </ContextMenu>
                </React.Fragment>
            )
        }
    }

    isLocalFile(path) {
        return !(path.indexOf('http://') > -1 || path.indexOf('https://') > -1)
    }
}

class Star extends Component {
    constructor(props) {
        super(props)
        this.handleModal = handleModal
    }

    state = {
        star: {
            id: 0,
            name: '',
            image: '',
            ignored: 0,
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
                start: 0,
                end: 0,
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

    handleStar_updateInfo(value, label) {
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
        const { star } = this.state

        Axios.get(`${config.api}/removestar.php?starID=${star.id}`).then(({ data }) => {
            if (data.success) {
                window.location.href = '/stars'
            }
        })
    }

    async handleStar_copy() {
        await navigator.clipboard.writeText(this.state.star.name)
    }

    handleStar_removeImage() {
        Axios.get(`${config.source}/ajax/remove_star_image.php?id=${this.state.star.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let star = prevState.star
                    star.image = null

                    return { star }
                })
            }
        })
    }

    handleStar_addImage(image) {
        Axios.get(`${config.source}/ajax/add_star_image.php?id=${this.state.star.id}&image=${image}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let star = prevState.star
                    star.image = `${this.state.star.id}.${data.ext}?v=${Date.now()}`

                    return { star }
                })
            }
        })
    }

    handleStar_addLocalImage(image) {
        console.log('Adding local file is not yet supported')
    }

    handleStar_ingore() {
        const status = +!this.state.star.ignored

        Axios.get(`${config.api}/ignore.php?starID=${this.state.star.id}&status=${status}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let star = prevState.star
                    star.ignored = status

                    return { star }
                })
            }
        })
    }

    isIgnored() {
        return this.state.star.ignored === 1
    }

    render() {
        return (
            <div className='star-page col-12'>
                {this.state.loaded.star && (
                    <div id='star'>
                        <StarImageDropbox
                            star={this.state.star}
                            removeStar={() => this.handleStar_remove()}
                            removeImage={() => this.handleStar_removeImage()}
                            addImage={(image) => this.handleStar_addImage(image)}
                            addImage_local={(image) => this.handleStar_addLocalImage(image)}
                        />

                        <ContextMenuTrigger id='title'>
                            <h2 className={this.isIgnored() ? 'ignored' : ''}>{this.state.star.name}</h2>
                        </ContextMenuTrigger>

                        <ContextMenu id='title'>
                            <MenuItem disabled onClick={(e) => this.handleStar_rename(e)}>
                                <i className={`${config.theme.fa} fa-edit`} /> Rename
                            </MenuItem>

                            <MenuItem disabled>
                                <i className={`${config.theme.fa} fa-plus`} /> Add Alias
                            </MenuItem>

                            <MenuItem onClick={() => this.handleStar_ingore()}>
                                <i className={`${config.theme.fa} ${this.isIgnored() ? 'fa-check' : 'fa-ban'}`} />{' '}
                                {this.isIgnored() ? 'Enable Star' : 'Ignore Star'}
                            </MenuItem>

                            <MenuItem divider />

                            <MenuItem onClick={() => this.handleStar_copy()}>
                                <i className={`${config.theme.fa} fa-copy`} /> Copy Star
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
                {this.state.loaded.videos && <StarVideos className='row col-12' videos={this.state.videos} />}

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
