import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'
import { PlyrComponent } from 'plyr-react'
import Hls from 'hls.js'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'

import Modal from '../modal'
import { DaysToYears } from '../date'

import '../styles/video.scss'

import config from '../config'

class VideoPage extends Component {
    state = {
        video: {
            id: 0,
            nextID: 0,
            name: '',
            star: '',
            path: {
                file: '',
                stream: '',
            },
            duration: 0,
            date: {
                added: '',
                published: '',
            },
            plays: 0,
            website: '',
            subsite: '',
            locations: [
                {
                    id: 0,
                    name: '',
                },
            ],
            attributes: [
                {
                    id: 0,
                    name: '',
                },
            ],
        },

        star: {
            id: 0,
            name: '',
            ageInVideo: 0,
            numVideos: 0,
        },

        bookmarks: [
            {
                id: 0,
                name: '',
                start: 0,
            },
        ],

        categories: [
            {
                id: 0,
                name: '',
            },
        ],

        attributes: [
            {
                id: 0,
                name: '',
            },
        ],

        locations: [
            {
                id: 0,
                name: '',
            },
        ],

        loaded: {
            hls: false,
            video: false,
            bookmarks: false,
            star: false,
            categories: false,
            attributes: false,
            locations: false,

            videoEvents: false,
        },

        seekSpeed: {
            regular: 1,
            wheel: 10,
        },

        modal: {
            visible: false,
            data: null,
        },

        newVideo: false,
        modalInput: '',
    }

    handleBadge(variation = null) {
        let data = ''
        let { numVideos } = this.state.star

        if (variation === 'data') {
            data = numVideos
        } else if (numVideos) {
            data = `badge-${'x'.repeat(String(numVideos).length)}`
        }

        return data
    }

    handleWheel(e) {
        this.player.player.currentTime += this.state.seekSpeed.wheel * Math.sign(e.deltaY) * -1
    }

    handleModal(title = null, data = null) {
        if (title !== null && data !== null && this.state.modal.visible) this.handleModal()

        this.setState((prevState) => {
            let modal = prevState.modal
            modal.title = title
            modal.data = data
            modal.visible = !modal.visible

            return { modal }
        })
    }

    handleModal_input(e) {
        let modalInput = e.target.value

        this.setState({ modalInput })
    }

    handleTitle_rename() {
        let title = this.state.modalInput

        Axios.get(`${config.api}/settitle.php?videoID=${this.state.video.id}&title=${title}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let video = prevState.video
                    video.name = title

                    return { video }
                })
            }
        })

        this.setState({ modalInput: '' })
    }

    async handleTitle_copy() {
        await navigator.clipboard.writeText(this.state.video.name)
    }

    async handleStar_copy() {
        await navigator.clipboard.writeText(this.state.video.star)
    }

    handleVideo_play(time) {
        const { player } = this.player

        player.currentTime = Number(time)
        player.play()
    }

    /* Bookmarks - own class? */
    handleBookmark_add(category) {
        let time = Math.round(this.player.player.currentTime)
        if (time) {
            Axios.get(`${config.api}/addbookmark.php?videoID=${this.state.video.id}&categoryID=${category.id}&time=${time}`).then(
                ({ data }) => {
                    if (data.success) {
                        this.setState((prevState) => {
                            let bookmarks = prevState.bookmarks
                            bookmarks.push({
                                id: data.id,
                                name: category.name,
                                start: time,
                            })

                            bookmarks.sort((a, b) => {
                                let valA = a.start
                                let valB = b.start

                                return valA - valB
                            })

                            return { bookmarks }
                        })
                    }
                }
            )
        }
    }

    handleBookmark_time(id) {
        let time = Math.round(this.player.player.currentTime)

        Axios.get(`${config.api}/changebookmarktime.php?id=${id}&time=${time}`).then(({ data }) => {
            if (data.success) {
                let bookmarks = this.state.bookmarks

                let arr = Object.keys(bookmarks).map((i) => {
                    if (bookmarks[i].id === id) bookmarks[i].start = time

                    return bookmarks[i]
                })

                bookmarks.sort((a, b) => {
                    let valA = a.start
                    let valB = b.start

                    return valA - valB
                })

                this.setState({ bookmarks: arr })
            }
        })
    }

    handleBookmark_remove(id) {
        Axios.get(`${config.api}/removebookmark.php?id=${id}`).then(() => {
            let bookmarks = this.state.bookmarks.filter((item) => {
                return item.id !== id
            })

            this.setState({ bookmarks })
        })
    }

    handleBookmark_clear() {
        Axios.get(`${config.api}/removebookmarks.php?id=${this.state.video.id}`).then(() => {
            this.setState(() => {
                let bookmarks = []
                return { bookmarks }
            })
        })
    }

    handleBookmark_category(category, bookmark) {
        Axios.get(`${config.api}/changebookmarkcategory.php?id=${bookmark.id}&categoryID=${category.id}`).then(() => {
            let bookmarks = this.state.bookmarks
            let obj = Object.keys(bookmarks).map((i) => {
                if (bookmarks[i].id === bookmark.id) {
                    let item = bookmarks[i]
                    item.name = category.name

                    return item
                }

                return bookmarks[i]
            })

            this.setState({ bookmarks: obj })
        })
    }

    /* Star - own class? */
    handleStar_remove(id) {
        Axios.get(`${config.api}/removevideostar.php?videoID=${this.state.video.id}&starID=${id}`).then(() => {
            let star = { id: 0, name: '' }
            this.setState({ star })
        })
    }

    /* Plays - own class? */
    handlePlays_add() {
        Axios.get(`${config.api}/addplay.php?videoID=${this.state.video.id}`).then(() => {
            console.log('Play Added')
        })
    }

    handlePlays_reset() {
        Axios.get(`${config.api}/removeplays.php?videoID=${this.state.video.id}`).then(() => {
            this.setState((prevState) => {
                let video = prevState.video
                video.plays = 0

                return { video }
            })
        })
    }

    /* Date - own class */
    handleDate_fix() {
        Axios.get(`${config.api}/fixvideodate.php?id=${this.state.video.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let date = prevState.video.date
                    date.published = data.date

                    return { date }
                })
            }
        })
    }

    /* Attribute - own class */
    handleAttribute_add(attribute) {
        Axios.get(`${config.api}/addattribute.php?videoID=${this.state.video.id}&attributeID=${attribute.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let attributes = prevState.video.attributes
                    attributes.push({ id: data.id, name: attribute.name })

                    attributes.sort((a, b) => {
                        return a.name.localeCompare(b.name)
                    })

                    let video = prevState.video
                    video.attributes = attributes

                    return { video }
                })
            }
        })
    }

    handleAttribute_remove(attribute) {
        Axios.get(`${config.api}/removeattribute.php?id=${attribute.id}`).then(() => {
            let attributes = this.state.video.attributes.filter((item) => {
                return item.id !== attribute.id
            })

            let video = this.state.video
            video.attributes = attributes

            this.setState({ video })
        })
    }

    /* Location - own class */
    handleLocation_add(location) {
        Axios.get(`${config.api}/addlocation.php?videoID=${this.state.video.id}&locationID=${location.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let locations = prevState.video.locations
                    locations.push({ id: data.id, name: location.name })

                    locations.sort((a, b) => {
                        return a.name.localeCompare(b.name)
                    })

                    let video = prevState.video
                    video.locations = locations

                    return { video }
                })
            }
        })
    }

    handleLocation_remove(location) {
        Axios.get(`${config.api}/removelocation.php?id=${location.id}`).then(() => {
            let locations = this.state.video.locations.filter((item) => {
                return item.id !== location.id
            })

            let video = this.state.video
            video.locations = locations

            this.setState({ video })
        })
    }

    render() {
        return (
            <div className='video-page col-12 row'>
                <section className='col-10'>
                    <header className='header row'>
                        <div className='col-11'>
                            <h1 className='header__title h2 align-middle'>
                                <div className='d-inline-block align-middle'>
                                    <ContextMenuTrigger id='title'>{this.state.video.name}</ContextMenuTrigger>
                                </div>

                                <ContextMenu id='title'>
                                    <MenuItem
                                        onClick={() => {
                                            this.setState({ modalInput: this.state.video.name })

                                            this.handleModal(
                                                'Change Title',
                                                <input
                                                    type='text'
                                                    className='text-center'
                                                    defaultValue={this.state.video.name}
                                                    onChange={this.handleModal_input.bind(this)}
                                                    ref={(input) => input && input.focus()}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()

                                                            this.handleModal()
                                                            this.handleTitle_rename()
                                                        }
                                                    }}
                                                />
                                            )
                                        }}
                                    >
                                        <i className={`${config.theme.fa} fa-edit`} /> Rename Title
                                    </MenuItem>

                                    <MenuItem
                                        onClick={() => {
                                            this.handleModal(
                                                'Add Attribute',
                                                Object.keys(this.state.attributes).map((attribute_i) => {
                                                    return (
                                                        <div
                                                            key={attribute_i}
                                                            className='btn btn-sm btn-outline-primary d-block'
                                                            onClick={() => {
                                                                this.handleModal()
                                                                this.handleAttribute_add(this.state.attributes[attribute_i])
                                                            }}
                                                        >
                                                            {this.state.attributes[attribute_i].name}
                                                        </div>
                                                    )
                                                })
                                            )
                                        }}
                                    >
                                        <i className='far fa-tag' /> Add Attribute
                                    </MenuItem>

                                    <MenuItem
                                        onClick={() => {
                                            this.handleModal(
                                                'Add Location',
                                                Object.keys(this.state.locations).map((location_i) => {
                                                    return (
                                                        <div
                                                            key={location_i}
                                                            className='btn btn-sm btn-outline-primary d-block'
                                                            onClick={() => {
                                                                this.handleModal()
                                                                this.handleLocation_add(this.state.locations[location_i])
                                                            }}
                                                        >
                                                            {this.state.locations[location_i].name}
                                                        </div>
                                                    )
                                                })
                                            )
                                        }}
                                    >
                                        <i className='far fa-map-marker-alt' /> Add Location
                                    </MenuItem>

                                    <MenuItem divider />

                                    <MenuItem onClick={() => this.handleTitle_copy()}>
                                        <i className='far fa-copy' /> Copy Title
                                    </MenuItem>

                                    <MenuItem onClick={() => this.handleStar_copy()}>
                                        <i className='far fa-user' /> Copy Star
                                    </MenuItem>
                                </ContextMenu>
                            </h1>

                            <div className='header__date btn btn-sm btn-outline-primary'>
                                <ContextMenuTrigger id='menu__date'>
                                    <i className='far fa-calendar-check' />
                                    {this.state.video.date.published}
                                </ContextMenuTrigger>

                                <ContextMenu id='menu__date'>
                                    <MenuItem onClick={() => this.handleDate_fix()}>
                                        <i className='far fa-edit' /> Fix Date
                                    </MenuItem>
                                </ContextMenu>
                            </div>

                            <div className='header__locations'>
                                {this.state.loaded.video &&
                                    Object.keys(this.state.video.locations).map((i) => (
                                        <div key={i} className='btn btn-sm btn-outline-danger location'>
                                            <ContextMenuTrigger id={`location-${i}`}>
                                                <i className='far fa-map-marker-alt' />
                                                {this.state.video.locations[i].name}
                                            </ContextMenuTrigger>

                                            <ContextMenu id={`location-${i}`}>
                                                <MenuItem onClick={() => this.handleLocation_remove(this.state.video.locations[i])}>
                                                    <i className='far fa-trash-alt' /> Remove
                                                </MenuItem>
                                            </ContextMenu>
                                        </div>
                                    ))}
                            </div>

                            <div className='header__attributes'>
                                {this.state.loaded.video &&
                                    Object.keys(this.state.video.attributes).map((i) => (
                                        <div key={i} className='btn btn-sm btn-outline-primary attribute'>
                                            <ContextMenuTrigger id={`attribute-${i}`}>
                                                <i className='far fa-tag' />
                                                {this.state.video.attributes[i].name}
                                            </ContextMenuTrigger>

                                            <ContextMenu id={`attribute-${i}`}>
                                                <MenuItem onClick={() => this.handleAttribute_remove(this.state.video.attributes[i])}>
                                                    <i className='far fa-trash-alt' /> Remove
                                                </MenuItem>
                                            </ContextMenu>
                                        </div>
                                    ))}
                            </div>

                            <div className='header__site'>
                                <span id='wsite'>{this.state.video.website}</span>
                                {this.state.video.subsite && (
                                    <React.Fragment>
                                        <span className='divider'>-</span>
                                        <span id='site'>{this.state.video.subsite}</span>
                                    </React.Fragment>
                                )}
                            </div>
                        </div>

                        <div className='col-1 header__next'>
                            <a
                                className='btn btn-sm btn-outline-primary float-right'
                                id='next'
                                href={`/video/${this.state.video.nextID}`}
                            >
                                Next
                            </a>
                        </div>
                    </header>

                    <div className='video-container' onWheel={(e) => this.handleWheel(e)}>
                        <ContextMenuTrigger id='video'>
                            {this.state.loaded.video && (
                                <PlyrComponent
                                    ref={(player) => (this.player = player)}
                                    options={{
                                        controls: ['play-large', 'play', 'current-time', 'progress', 'duration', 'fullscreen'],
                                        hideControls: false,
                                        ratio: '21:9',
                                        keyboard: { global: true }, // TODO Create own keyboard shortcuts/commands
                                        seekTime: this.state.seekSpeed.regular,
                                        previewThumbnails: {
                                            enabled: true, // TODO Check if this should be enabled...perhaps from config.source, or config.api later
                                            src: `${config.source}/vtt/${this.state.video.id}.vtt`,
                                        },
                                    }}
                                    sources={{
                                        type: 'video',
                                        sources: [
                                            {
                                                src: `${config.source}/videos/${this.state.video.path.stream}`,
                                                type: 'application/x-mpegURL',
                                            },
                                            {
                                                src: `${config.source}/videos/${this.state.video.path.file}`,
                                                type: 'video/mp4',
                                            },
                                        ],
                                    }}
                                />
                            )}
                        </ContextMenuTrigger>

                        <ContextMenu id='video'>
                            <MenuItem
                                onClick={() => {
                                    this.handleModal(
                                        'Add Bookmark',
                                        Object.keys(this.state.categories).map((i) => {
                                            return (
                                                <div
                                                    key={i}
                                                    className='btn btn-sm btn-outline-primary d-block'
                                                    onClick={() => {
                                                        this.handleModal()
                                                        this.handleBookmark_add(this.state.categories[i])
                                                    }}
                                                >
                                                    {this.state.categories[i].name}
                                                </div>
                                            )
                                        })
                                    )
                                }}
                            >
                                <i className={`${config.theme.fa} fa-plus`} /> Add Bookmark
                            </MenuItem>

                            <MenuItem disabled>
                                <i className='far fa-plus' /> Set Age
                            </MenuItem>

                            <MenuItem disabled>
                                <i className='far fa-edit' /> Toggle Controls
                            </MenuItem>

                            <MenuItem disabled>
                                <i className='far fa-edit' /> Rename File
                            </MenuItem>

                            <MenuItem disabled>
                                <i className='far fa-edit' /> Fix Thumbnails
                            </MenuItem>

                            <MenuItem divider />

                            <MenuItem onClick={() => this.handleBookmark_clear()}>
                                <i className='far fa-trash-alt' /> Remove Bookmarks
                            </MenuItem>

                            <MenuItem onClick={() => this.handlePlays_reset()}>
                                <i className='far fa-trash-alt' /> Remove Plays
                            </MenuItem>

                            <MenuItem divider />

                            <MenuItem
                                onClick={() => {
                                    window.open(`${config.source}/video.php?id=${this.state.video.id}`, '_blank')
                                }}
                            >
                                Open in Backup
                            </MenuItem>
                        </ContextMenu>
                    </div>

                    <div className='col-12' id='timeline'>
                        {this.state.loaded.bookmarks &&
                            this.state.loaded.video &&
                            Object.keys(this.state.bookmarks).map((i) => (
                                <React.Fragment key={i}>
                                    <div
                                        className='btn btn-sm btn-outline-primary bookmark'
                                        style={{
                                            left: `${
                                                ((this.state.bookmarks[i].start * 100) / this.state.video.duration) *
                                                config.timeline.offset
                                            }%`,
                                        }}
                                        onClick={() => this.handleVideo_play(this.state.bookmarks[i].start)}
                                        ref={(bookmark) => (this.bookmarks[i] = bookmark)}
                                        data-level={i}
                                    >
                                        <ContextMenuTrigger id={`bookmark-${i}`}>{this.state.bookmarks[i].name}</ContextMenuTrigger>
                                    </div>

                                    <ContextMenu id={`bookmark-${i}`}>
                                        <MenuItem
                                            onClick={() => {
                                                this.handleModal(
                                                    'Change Category',
                                                    Object.keys(this.state.categories)
                                                        .filter((category_i) => {
                                                            return this.state.categories[category_i].name !== this.state.bookmarks[i].name
                                                        })
                                                        .map((category_i) => {
                                                            return (
                                                                <div
                                                                    key={category_i}
                                                                    className='btn btn-sm btn-outline-primary d-block w-auto'
                                                                    onClick={() => {
                                                                        this.handleModal()
                                                                        this.handleBookmark_category(
                                                                            this.state.categories[category_i],
                                                                            this.state.bookmarks[i]
                                                                        )
                                                                    }}
                                                                >
                                                                    {this.state.categories[category_i].name}
                                                                </div>
                                                            )
                                                        })
                                                )
                                            }}
                                        >
                                            <i className={`${config.theme.fa} fa-edit`} /> Change Category
                                        </MenuItem>

                                        <MenuItem onClick={() => this.handleBookmark_time(this.state.bookmarks[i].id)}>
                                            <i className={`${config.theme.fa} fa-clock`} /> Change Time
                                        </MenuItem>

                                        <MenuItem divider />

                                        <MenuItem onClick={() => this.handleBookmark_remove(this.state.bookmarks[i].id)}>
                                            <i className={`${config.theme.fa} fa-trash-alt`} /> Delete
                                        </MenuItem>
                                    </ContextMenu>
                                </React.Fragment>
                            ))}
                    </div>
                </section>

                <aside className='col-2'>
                    <div id='stars' className='row justify-content-center'>
                        {this.state.loaded.star && this.state.star.id !== 0 && (
                            <div className='star'>
                                <div className={`card mb-2 ribbon-container ${this.handleBadge()}`} data-badge={this.handleBadge('data')}>
                                    <ContextMenuTrigger id='star'>
                                        <img
                                            className='star__image card-img-top'
                                            alt='star'
                                            src={`${config.source}/images/stars/${this.state.star.id}`}
                                        />

                                        <Link to={`/star/${this.state.star.id}`} className='star__name d-block'>
                                            {this.state.star.name}
                                        </Link>

                                        {this.state.star.ageInVideo > 0 && (
                                            <span className='ribbon'>
                                                <DaysToYears>{this.state.star.ageInVideo}</DaysToYears>
                                            </span>
                                        )}
                                    </ContextMenuTrigger>
                                </div>

                                <ContextMenu id='star'>
                                    <MenuItem
                                        onClick={() => {
                                            this.handleModal(
                                                'Add Bookmark',
                                                Object.keys(this.state.categories).map((i) => {
                                                    return (
                                                        <div
                                                            key={i}
                                                            className='btn btn-sm btn-outline-primary d-block w-auto'
                                                            onClick={() => {
                                                                this.handleModal()
                                                                this.handleBookmark_add(this.state.categories[i])
                                                            }}
                                                        >
                                                            {this.state.categories[i].name}
                                                        </div>
                                                    )
                                                })
                                            )
                                        }}
                                    >
                                        <i className='far fa-plus' /> Add Bookmark
                                    </MenuItem>

                                    <MenuItem divider />

                                    <MenuItem onClick={() => this.handleStar_remove(this.state.star.id)}>
                                        <i className='far fa-trash-alt' /> Remove
                                    </MenuItem>
                                </ContextMenu>
                            </div>
                        )}
                    </div>
                </aside>

                <Modal visible={this.state.modal.visible} onClose={() => this.handleModal()} title={this.state.modal.title}>
                    {this.state.modal.data}
                </Modal>
            </div>
        )
    }

    componentDidMount() {
        this.bookmarks = []

        this.getData()
    }

    componentDidUpdate() {
        if (this.state.loaded.video) {
            /* Event Handler */
            if (!this.state.loaded.videoEvents) {
                this.player.player.on('timeupdate', () => {
                    if (this.player.player.currentTime) {
                        localStorage.bookmark = Math.round(this.player.player.currentTime)
                    }
                })

                this.player.player.on('play', () => {
                    localStorage.playing = 1

                    if (this.state.newVideo) {
                        this.handlePlays_add()
                        this.setState({ newVideo: false })
                    }
                })

                this.player.player.on('pause', () => {
                    localStorage.playing = 0
                })

                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.videoEvents = true

                    return { loaded }
                })
            }

            /* HLS Handler */
            if (!this.state.loaded.hls && Hls.isSupported() && config.hls.enabled) {
                const hls = new Hls({ autoStartLoad: false })
                hls.loadSource(this.player.player.media.firstElementChild.getAttribute('src'))
                hls.attachMedia(this.player.player.media)

                hls.on(Hls.Events.MANIFEST_PARSED, (e, data) => {
                    const dataLevels = data['levels'].length - 1

                    const levels = config.hls.levels
                    const maxLevel = levels[config.hls.maxLevel]
                    const maxStartLevel = levels[config.hls.maxStartLevel]

                    // Default start level to maxLevel-1
                    let desiredStartLevel = maxLevel - 1
                    // Start level should never be above maxStartLevel
                    if (desiredStartLevel > maxStartLevel) desiredStartLevel = maxStartLevel
                    // Check if start level is too high
                    if (desiredStartLevel > dataLevels) desiredStartLevel = dataLevels - 1
                    // Check if start level is too low
                    if (desiredStartLevel < 0) desiredStartLevel = 0

                    hls.startLevel = desiredStartLevel
                    hls.autoLevelCapping = maxLevel

                    if (Number(localStorage.video) === this.state.video.id) {
                        hls.startLoad(Number(localStorage.bookmark))

                        if (Boolean(Number(localStorage.playing))) this.handleVideo_play(localStorage.bookmark)

                        this.setState({ newVideo: false })
                    } else {
                        localStorage.video = this.state.video.id
                        localStorage.bookmark = 0

                        this.setState({ newVideo: true })

                        hls.startLoad()
                    }
                })

                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.hls = true

                    return { loaded }
                })
            }

            /* Collision Check */
            const collisionCheck = (a, b) => {
                if (typeof a === 'undefined' || typeof b === 'undefined') return false
                if (a === null || b === null) return false

                a = a.getBoundingClientRect()
                b = b.getBoundingClientRect()

                return !(a.x + a.width < b.x - config.timeline.spacing || a.x + config.timeline.spacing > b.x + b.width)
            }

            for (let i = 1, items = this.bookmarks, LEVEL_MIN = 1, LEVEL_MAX = 10, level = LEVEL_MIN; i < items.length; i++) {
                let collision = false

                let first = items[i - 1]
                let second = items[i]

                if (first === null || second === null) continue // skip if error

                if (collisionCheck(first, second)) {
                    collision = true
                } else {
                    collision = false

                    for (let j = 1; j < i; j++) {
                        if (collisionCheck(items[j], second)) collision = true
                    }
                }

                if (collision && level < LEVEL_MAX) {
                    level++
                } else {
                    level = LEVEL_MIN
                }

                second.setAttribute('data-level', level)
            }
        }
    }

    getData() {
        let { id } = this.props.match.params

        Axios.get(`${config.api}/video.php?id=${id}`)
            .then(({ data: video }) => this.setState({ video }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.video = true

                    return { loaded }
                })
            })

        Axios.get(`${config.api}/bookmarks.php?id=${id}`)
            .then(({ data: bookmarks }) => this.setState({ bookmarks }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.bookmarks = true

                    return { loaded }
                })
            })

        Axios.get(`${config.api}/stars.php?videoID=${id}`)
            .then(({ data: star }) => this.setState({ star }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.star = true

                    return { loaded }
                })
            })

        Axios.get(`${config.api}/categories.php`)
            .then(({ data: categories }) => this.setState({ categories }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.categories = true

                    return { loaded }
                })
            })

        Axios.get(`${config.api}/attributes.php`)
            .then(({ data: attributes }) => this.setState({ attributes }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.attributes = true

                    return { loaded }
                })
            })

        Axios.get(`${config.api}/locations.php`)
            .then(({ data: locations }) => this.setState({ locations }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.locations = true

                    return { loaded }
                })
            })
    }
}

export default VideoPage
