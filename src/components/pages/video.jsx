import React, {Component} from 'react'
import Axios from "axios"
import {PlyrComponent} from "plyr-react"
import Hls from "hls.js"
import {ContextMenu, MenuItem, ContextMenuTrigger} from "react-contextmenu"

import Modal from "../modal"

import "../styles/video.scss"

import config from "../config"

class VideoPage extends Component {
    state = {
        video: {
            id: 0,
            nextID: 0,
            name: "",
            star: "",
            path: {
                file: "",
                stream: "",
            },
            duration: 0,
            date: {
                added: "",
                published: ""
            },
            plays: 0,
            website: "",
            subsite: "",
            locations: [
                {
                    id: 0,
                    name: ""
                }
            ],
            attributes: [
                {
                    id: 0,
                    name: ""
                }
            ]
        },

        star: {
            id: 0,
            name: "",
        },

        bookmarks: [
            {
                id: 0,
                name: "",
                start: 0,
            },
        ],

        categories: [
            {
                id: 0,
                name: "",
            }
        ],

        attributes: [
            {
                id: 0,
                name: ""
            }
        ],

        locations: [
            {
                id: 0,
                name: ""
            }
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
            wheel: 10
        },

        modal: {
            visible: false,
            data: null,
        },
    }

    handleWheel(e) {
        this.player.player.currentTime += (this.state.seekSpeed.wheel * Math.sign(e.deltaY) * -1)
    }

    handleModal(title = null, data = null) {
        this.setState(prevState => {
            let modal = prevState.modal
            modal.title = title
            modal.data = data
            modal.visible = !modal.visible

            return {modal}
        })
    }

    async handleTitle_copy() {
        await navigator.clipboard.writeText(this.state.video.name)
    }

    async handleStar_copy() {
        await navigator.clipboard.writeText(this.state.video.star)
    }

    handleVideoPlay(time) {
        this.player.player.currentTime = Number(time)
        this.player.player.play()
    }

    /* Bookmarks - own class? */
    handleBookmark_play(time) {
        this.player.player.currentTime = time
        this.player.player.play()
    }

    handleBookmark_add(category) {
        let time = Math.round(this.player.player.currentTime)
        if (time) {
            Axios.get(`${config.api}/addbookmark.php?videoID=${this.state.video.id}&categoryID=${category.id}&time=${time}`)
                .then(({data}) => {
                    if (data.success) {
                        this.setState(prevState => {
                            let bookmarks = prevState.bookmarks
                            bookmarks.push({id: data.id, name: category.name, start: time})

                            return {bookmarks}
                        })
                    }
                })
        }
    }

    handleBookmark_remove(id) {
        Axios.get(`${config.api}/removebookmark.php?id=${id}`)
            .then(() => {
                let bookmarks = this.state.bookmarks.filter((item) => {
                    return item.id !== id
                })

                this.setState({bookmarks})
            })
    }

    handleBookmark_clear() {
        Axios.get(`${config.api}/removebookmarks.php?id=${this.state.video.id}`)
            .then(() => {
                this.setState(() => {
                    let bookmarks = [{id: 0, name: "", start: 0}]
                    return {bookmarks}
                })
            })
    }

    handleBookmark_time(id) {
        let time = Math.round(this.player.player.currentTime)

        Axios.get(`${config.api}/changebookmarktime.php?id=${id}&time=${time}`)
            .then(({data}) => {
                if (data.success) {
                    let bookmarks = this.state.bookmarks

                    let arr = Object.keys(bookmarks).map((i) => {
                        if (bookmarks[i].id === id) bookmarks[i].start = time

                        return bookmarks[i]
                    })

                    this.setState({bookmarks: arr})
                }
            })
    }

    handleBookmark_category(category, bookmark) {
        Axios.get(`${config.api}/changebookmarkcategory.php?id=${bookmark.id}&categoryID=${category.id}`)
            .then(() => {
                let bookmarks = this.state.bookmarks
                let obj = Object.keys(bookmarks).map((i) => {
                    if (bookmarks[i].id === bookmark.id) {
                        let item = bookmarks[i]
                        item.name = category.name

                        return item
                    }

                    return bookmarks[i]
                })

                this.setState({bookmarks: obj})
            })
    }

    /* Star - own class? */
    handleStar_remove(id) {
        Axios.get(`${config.api}/removevideostar.php?videoID=${this.state.video.id}&starID=${id}`)
            .then(() => {
                let star = {id: 0, name: ""}
                this.setState({star})
            })
    }

    /* Plays - own class? */
    handlePlays_reset() {
        Axios.get(`${config.api}/removeplays.php?videoID=${this.state.video.id}`)
            .then(() => {
                this.setState(prevState => {
                    let video = prevState.video
                    video.plays = 0

                    return {video}
                })
            })
    }

    handleDate_fix() {
        Axios.get(`${config.api}/fixvideodate.php?id=${this.state.video.id}`)
            .then(({data}) => {
                if (data.success) {
                    this.setState(prevState => {
                        let video = prevState.video
                        video.date.published = data.date

                        return {video}
                    })
                }
            })
    }

    handleAttribute_add(attribute) {
        Axios.get(`${config.api}/addattribute.php?videoID=${this.state.video.id}&attributeID=${attribute.id}`)
            .then(({data}) => {
                if (data.success) {
                    this.setState(prevState => {
                        let attributes = prevState.video.attributes
                        attributes.push({id: data.id, name: attribute.name})

                        attributes.sort((a, b) => {
                            return a.name.localeCompare(b.name)
                        })

                        let video = prevState.video
                        video.attributes = attributes

                        return {video}
                    })
                }
            })
    }

    handleAttribute_remove(attribute) {
        Axios.get(`${config.api}/removeattribute.php?id=${attribute.id}`)
            .then(() => {
                let attributes = this.state.video.attributes.filter((item) => {
                    return item.id !== attribute.id
                })

                let video = this.state.video
                video.attributes = attributes

                this.setState({video})
            })
    }

    handleLocation_add(location) {
        Axios.get(`${config.api}/addlocation.php?videoID=${this.state.video.id}&locationID=${location.id}`)
            .then(({data}) => {
                if (data.success) {
                    this.setState(prevState => {
                        let locations = prevState.video.locations
                        locations.push({id: data.id, name: location.name})

                        locations.sort((a, b) => {
                            return a.name.localeCompare(b.name)
                        })

                        let video = prevState.video
                        video.locations = locations

                        return {video}
                    })
                }
            })
    }

    handleLocation_remove(location) {
        Axios.get(`${config.api}/removelocation.php?id=${location.id}`)
            .then(() => {
                let locations = this.state.video.locations.filter((item) => {
                    return item.id !== location.id
                })

                let video = this.state.video
                video.locations = locations

                this.setState({video})
            })
    }

    render() {
        return (
            <div className="video-page col-12 row">
                <section className="col-10">
                    <header className="header row">
                        <div className="col-12">
                            <h1 className="header__title h2 align-middle">
                                <div className="d-inline-block align-middle">
                                    <ContextMenuTrigger id="title">{this.state.video.name}</ContextMenuTrigger>
                                </div>

                                <ContextMenu id="title">
                                    <MenuItem disabled><i className="far fa-edit"/> Rename</MenuItem>

                                    <MenuItem onClick={() => {
                                        this.handleModal("Add Attribute",
                                            Object.keys(this.state.attributes).map((a_i) => {
                                                return (
                                                    <div key={a_i}
                                                         className="btn btn-sm btn-outline-primary d-block"
                                                         onClick={() => {
                                                             this.handleModal()
                                                             this.handleAttribute_add(this.state.attributes[a_i])
                                                         }}
                                                    >{this.state.attributes[a_i].name}</div>
                                                )
                                            })
                                        )
                                    }}><i className="far fa-tag"/> Add Attribute</MenuItem>

                                    <MenuItem onClick={() => {
                                        this.handleModal("Add Location",
                                            Object.keys(this.state.locations).map((l_i) => {
                                                return (
                                                    <div key={l_i}
                                                         className="btn btn-sm btn-outline-primary d-block"
                                                         onClick={() => {
                                                             this.handleModal()
                                                             this.handleLocation_add(this.state.locations[l_i])
                                                         }}
                                                    >{this.state.locations[l_i].name}</div>
                                                )
                                            })
                                        )
                                    }}><i className="far fa-tag"/> Add Location</MenuItem>

                                    <hr/>

                                    <MenuItem onClick={() => this.handleTitle_copy()}>
                                        <i className="far fa-copy"/> Copy Title
                                    </MenuItem>

                                    <MenuItem onClick={() => this.handleStar_copy()}><i className="far fa-user"/> Copy
                                        Star</MenuItem>
                                </ContextMenu>
                            </h1>

                            <div className="header__date btn btn-sm btn-outline-primary">
                                <ContextMenuTrigger id="menu__date">
                                    <i className="far fa-calendar-check"/>
                                    {this.state.video.date.published}
                                </ContextMenuTrigger>

                                <ContextMenu id="menu__date">
                                    <MenuItem onClick={() => this.handleDate_fix()}>
                                        <i className="far fa-edit"/> Fix Date
                                    </MenuItem>
                                </ContextMenu>
                            </div>
                            <div className="header__locations">
                                {this.state.loaded.video && Object.keys(this.state.video.locations).map((i) => (
                                    <div key={i} className="btn btn-sm btn-outline-danger location">
                                        <ContextMenuTrigger id={`location-${i}`}>
                                            {this.state.video.locations[i].name}
                                        </ContextMenuTrigger>

                                        <ContextMenu id={`location-${i}`}>
                                            <MenuItem
                                                onClick={() => this.handleLocation_remove(this.state.video.locations[i])}>
                                                <i className="far fa-trash-alt"/> Remove
                                            </MenuItem>
                                        </ContextMenu>
                                    </div>
                                ))}
                            </div>
                            <div className="header__attributes">
                                {this.state.loaded.video && Object.keys(this.state.video.attributes).map((i) => (
                                    <div key={i} className="btn btn-sm btn-outline-primary attribute">
                                        <ContextMenuTrigger id={`attribute-${i}`}>
                                            {this.state.video.attributes[i].name}
                                        </ContextMenuTrigger>

                                        <ContextMenu id={`attribute-${i}`}>
                                            <MenuItem
                                                onClick={() => this.handleAttribute_remove(this.state.video.attributes[i])}>
                                                <i className="far fa-trash-alt"/> Remove
                                            </MenuItem>
                                        </ContextMenu>
                                    </div>
                                ))}
                            </div>
                            <div className="header__site">
                                <ContextMenuTrigger id="menu__website">
                                    <span id="wsite">{this.state.video.website}</span>
                                    {this.state.video.subsite && (
                                        <React.Fragment>
                                            <span className="separator">-</span>
                                            <span id="site">{this.state.video.subsite}</span>
                                        </React.Fragment>
                                    )}
                                </ContextMenuTrigger>

                                <ContextMenu id="menu__website">
                                    <MenuItem disabled>
                                        <i className="far fa-edit"/> Fix Website & Site
                                    </MenuItem>
                                </ContextMenu>
                            </div>
                            <a className="header__next btn btn-outline-primary float-right" id="next"
                               href={`/video/${this.state.video.nextID}`}>Next</a>
                        </div>
                    </header>

                    <div className="video-container" onWheel={this.handleWheel.bind(this)}>
                        <ContextMenuTrigger id="video">
                            {this.state.loaded.video && (
                                <PlyrComponent ref={(player) => this.player = player}
                                               options={{
                                                   'controls': [
                                                       "play-large", "play", "current-time",
                                                       "progress", "duration", "fullscreen"
                                                   ],
                                                   "hideControls": false,
                                                   "ratio": "21:9",
                                                   "keyboard": {global: true},
                                                   "seekTime": this.state.seekSpeed.regular,
                                                   "previewThumbnails": {
                                                       enabled: true,
                                                       src: `${config.source}/vtt/${this.state.video.id}.vtt`
                                                   }
                                               }}
                                               sources={{
                                                   type: 'video',
                                                   sources: [
                                                       {
                                                           src: `${config.source}/videos/${this.state.video.path.stream}`,
                                                           type: "application/x-mpegURL"
                                                       },
                                                       {
                                                           src: `${config.source}/videos/${this.state.video.path.file}`,
                                                           type: "video/mp4"
                                                       }
                                                   ]
                                               }}
                                />
                            )}
                        </ContextMenuTrigger>

                        <ContextMenu id="video">
                            <MenuItem onClick={() => {
                                this.handleModal("Add Bookmark",
                                    Object.keys(this.state.categories).map((i) => {
                                        return (
                                            <div key={i} className="btn btn-sm btn-outline-primary d-block"
                                                 onClick={() => {
                                                     this.handleModal()
                                                     this.handleBookmark_add(this.state.categories[i])
                                                 }}
                                            >{this.state.categories[i].name}</div>
                                        )
                                    })
                                )
                            }}><i className="far fa-plus"/> Add Bookmark</MenuItem>

                            <MenuItem disabled>
                                <i className="far fa-plus"/> Set Age
                            </MenuItem>

                            <MenuItem disabled>
                                <i className="far fa-edit"/> Toggle Controls
                            </MenuItem>

                            <MenuItem disabled>
                                <i className="far fa-edit"/> Rename File
                            </MenuItem>

                            <MenuItem disabled>
                                <i className="far fa-edit"/> Fix Thumbnails
                            </MenuItem>

                            <hr/>

                            <MenuItem onClick={() => this.handleBookmark_clear()}>
                                <i className="far fa-trash-alt"/> Remove Bookmarks
                            </MenuItem>

                            <MenuItem onClick={() => this.handlePlays_reset()}>
                                <i className="far fa-trash-alt"/> Remove Plays
                            </MenuItem>
                        </ContextMenu>
                    </div>

                    <div className="col-12" id="timeline">
                        {this.state.loaded.bookmarks && this.state.loaded.video && Object.keys(this.state.bookmarks).map((i) => (
                            <React.Fragment key={i}>
                                <div className="btn btn-sm btn-outline-primary bookmark"
                                     style={{left: `${(this.state.bookmarks[i].start * 100 / this.state.video.duration) * 0.89}%`}}
                                     onClick={() => this.handleBookmark_play(this.state.bookmarks[i].start)}
                                     ref={(bookmark => this.bookmarks[i] = bookmark)} data-level={i}
                                >
                                    <ContextMenuTrigger id={`bookmark-${i}`}>
                                        {this.state.bookmarks[i].name}
                                    </ContextMenuTrigger>
                                </div>

                                <ContextMenu id={`bookmark-${i}`}>
                                    <MenuItem onClick={() => {
                                        this.handleModal("Change Category",
                                            Object.keys(this.state.categories).filter((c_i) => {
                                                return this.state.categories[c_i].name !== this.state.bookmarks[i].name
                                            }).map((c_i) => {
                                                return (
                                                    <div key={c_i}
                                                         className="btn btn-sm btn-outline-primary d-block w-auto"
                                                         onClick={() => {
                                                             this.handleModal()
                                                             this.handleBookmark_category(this.state.categories[c_i], this.state.bookmarks[i])
                                                         }}>{this.state.categories[c_i].name}</div>
                                                )
                                            })
                                        )
                                    }}><i className="far fa-edit"/> Change Category</MenuItem>

                                    <MenuItem onClick={() => this.handleBookmark_time(this.state.bookmarks[i].id)}>
                                        <i className="far fa-clock"/> Change Time
                                    </MenuItem>

                                    <hr/>

                                    <MenuItem onClick={() => this.handleBookmark_remove(this.state.bookmarks[i].id)}>
                                        <i className="far fa-trash-alt"/> Delete
                                    </MenuItem>
                                </ContextMenu>
                            </React.Fragment>
                        ))}
                    </div>
                </section>

                <aside className="col-2">
                    <div id="stars" className="row justify-content-center">
                        {this.state.loaded.star && (
                            <React.Fragment>
                                <div className="star col-12">
                                    <ContextMenuTrigger id="star">
                                        <img className="star__image w-100" alt="star"
                                             src={`${config.source}/images/stars/${this.state.star.id}`}/>
                                        <a href={`${config.source}/star.php?id=${this.state.star.id}`}
                                           className="star__name d-block">{this.state.star.name}</a>
                                    </ContextMenuTrigger>
                                </div>

                                <ContextMenu id="star">
                                    <MenuItem onClick={() => {
                                        this.handleModal("Add Bookmark",
                                            Object.keys(this.state.categories).map((i) => {
                                                return (
                                                    <div key={i}
                                                         className="btn btn-sm btn-outline-primary d-block w-auto"
                                                         onClick={() => {
                                                             this.handleModal()
                                                             this.handleBookmark_add(this.state.categories[i])
                                                         }}
                                                    >{this.state.categories[i].name}</div>
                                                )
                                            })
                                        )
                                    }}><i className="far fa-plus"/> Add Bookmark</MenuItem>

                                    <hr/>

                                    <MenuItem onClick={() => this.handleStar_remove(this.state.star.id)}>
                                        <i className="far fa-trash-alt"/> Remove
                                    </MenuItem>
                                </ContextMenu>
                            </React.Fragment>
                        )}
                    </div>
                </aside>

                <Modal
                    visible={this.state.modal.visible}
                    onClose={() => this.handleModal()}
                    title={this.state.modal.title}
                >{this.state.modal.data}</Modal>
            </div>
        )
    }

    componentDidMount() {
        this.bookmarks = []

        this.getData()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
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
                })

                this.player.player.on('pause', () => {
                    localStorage.playing = 0
                })

                this.setState(prevState => {
                    let loaded = prevState.loaded
                    loaded.videoEvents = true

                    return {loaded}
                })
            }

            /* HLS Handler */
            if (!this.state.loaded.hls && Hls.isSupported()) {
                const hls = new Hls({autoStartLoad: false})
                hls.loadSource(this.player.player.media.firstElementChild.getAttribute('src'))
                hls.attachMedia(this.player.player.media)

                hls.on(Hls.Events.MANIFEST_PARSED, (e, data) => {
                    const dataLevels = data['levels'].length - 1

                    let levels = {360: 0, 480: 1, 720: 2, 1080: 3, 1440: 4, 2160: 5}
                    let maxLevel = levels[720]
                    let maxStartLevel = levels[480]

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

                        if (Boolean(Number(localStorage.playing))) this.handleVideoPlay(localStorage.bookmark)
                    } else {
                        localStorage.video = this.state.video.id
                        localStorage.bookmark = 0

                        hls.startLoad()
                    }
                })

                this.setState(prevState => {
                    let loaded = prevState.loaded
                    loaded.hls = true

                    return {loaded}
                })
            }

            /* Collision Check */
            const collisionCheck = (a, b) => {
                if (typeof a === "undefined" || typeof b === "undefined") return false
                if (a === null || b === null) return false

                a = a.getBoundingClientRect()
                b = b.getBoundingClientRect()

                return !((a.x + a.width) < b.x) || (a.x > (b.x + b.width))
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
        let {id} = this.props.match.params

        Axios.get(`${config.api}/video.php?id=${id}`)
            .then(({data: video}) => this.setState({video}))
            .then(() => {
                this.setState(prevState => {
                    let loaded = prevState.loaded
                    loaded.video = true

                    return {loaded}
                })
            })

        Axios.get(`${config.api}/stars.php?videoID=${id}`)
            .then(({data: star}) => this.setState({star}))
            .then(() => {
                this.setState(prevState => {
                    let loaded = prevState.loaded
                    loaded.star = true

                    return {loaded}
                })
            })

        Axios.get(`${config.api}/bookmarks.php?id=${id}`)
            .then(({data: bookmarks}) => this.setState({bookmarks}))
            .then(() => {
                this.setState(prevState => {
                    let loaded = prevState.loaded
                    loaded.bookmarks = true

                    return {loaded}
                })
            })

        Axios.get(`${config.api}/categories.php`)
            .then(({data: categories}) => this.setState({categories}))
            .then(() => {
                this.setState(prevState => {
                    let loaded = prevState.loaded
                    loaded.categories = true

                    return {loaded}
                })
            })

        Axios.get(`${config.api}/attributes.php`)
            .then(({data: attributes}) => this.setState({attributes}))
            .then(() => {
                this.setState(prevState => {
                    let loaded = prevState.loaded
                    loaded.attributes = true

                    return {loaded}
                })
            })

        Axios.get(`${config.api}/locations.php`)
            .then(({data: locations}) => this.setState({locations}))
            .then(() => {
                this.setState(prevState => {
                    let loaded = prevState.loaded
                    loaded.locations = true

                    return {loaded}
                })
            })
    }
}

export default VideoPage