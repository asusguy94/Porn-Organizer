import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'
import { PlyrComponent } from 'plyr-react'
import Hls from 'hls.js'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import KeyboardEventHandler from 'react-keyboard-event-handler'

import Modal, { handleModal } from '../modal/modal'
import { DaysToYears } from '../date/date'

import './video.scss'

import config from '../config'

class VideoPage extends Component {
    constructor(props) {
        super(props)
        this.handleModal = handleModal
    }

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
        input: {
            video: '',
            age: '',
            title: '',
        },
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

    handleInput(e, field) {
        let inputValue = e.target.value

        this.setState((prevState) => {
            let { input } = prevState
            input[field] = inputValue

            return { input }
        })
    }

    handleInput_reset(field) {
        this.setState((prevState) => {
            let { input } = prevState
            input[field] = ''

            return { input }
        })
    }

    handleTitle_rename() {
        let title = this.state.input.title

        Axios.get(`${config.api}/settitle.php?videoID=${this.state.video.id}&title=${title}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let { video } = prevState
                    video.name = title

                    return { video }
                })
            }
        })

        this.handleInput_reset('title')
    }

    async handleTitle_copy() {
        await navigator.clipboard.writeText(this.state.video.name)
    }

    async handleStar_copy() {
        await navigator.clipboard.writeText(this.state.video.star)
    }

    handleVideo_isPlaying() {
        const { player } = this.player

        return player.playing
    }

    handleVideo_pause() {
        const { player } = this.player

        player.pause()
    }

    handleVideo_play(time = null) {
        const { player } = this.player

        if (time === null) time = player.currentTime
        player.currentTime = Number(time)
        player.play()
    }

    handleVideo_playpause() {
        if (this.handleVideo_isPlaying()) this.handleVideo_pause()
        else this.handleVideo_play()
    }

    handleVideo_forward(time = this.state.seekSpeed.regular) {
        const { player } = this.player

        player.currentTime += Number(time)
    }

    handleVideo_rewind(time = this.state.seekSpeed.regular) {
        const { player } = this.player

        player.currentTime -= Number(time)
    }

    handleVideo_rename() {
        const { video, input } = this.state

        Axios.get(`${config.source}/ajax/rename_file.php?videoID=${video.id}&videoPath=${input.video}`).then(({ data }) => {
            if (data.success) {
                window.location.reload()
            }
        })

        this.handleInput_reset('video')
    }

    handleVideo_setAge() {
        const { video, input } = this.state

        Axios.get(`${config.api}/setage.php?videoID=${video.id}&age=${input.age}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let { star } = prevState
                    star.ageInVideo = Number(input.age) * 365

                    return { star }
                })
            }
        })
        this.handleInput_reset('age')
    }

    handleVideo_delete() {
        const { video } = this.state

        Axios.get(`${config.source}/ajax/remove_video.php?videoID=${video.id}`).then(({ data }) => {
            if (data.success) {
                window.location.href = '/videos'
            }
        })
    }

    /* Bookmarks - own class? */
    handleBookmark_add(category) {
        let time = Math.round(this.player.player.currentTime)
        if (time) {
            Axios.get(`${config.api}/addbookmark.php?videoID=${this.state.video.id}&categoryID=${category.id}&time=${time}`).then(
                ({ data }) => {
                    if (data.success) {
                        this.setState((prevState) => {
                            let { bookmarks } = prevState
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

                let arr = bookmarks.map((item) => {
                    if (item.id === id) item.start = time

                    return item
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
        Axios.get(`${config.api}/removebookmark.php?id=${id}`).then(({ data }) => {
            if (data.success) {
                let bookmarks = this.state.bookmarks.filter((item) => {
                    return item.id !== id
                })

                this.setState({ bookmarks })
            }
        })
    }

    handleBookmark_clear() {
        Axios.get(`${config.api}/removebookmarks.php?id=${this.state.video.id}`).then(({ data }) => {
            if (data.success) {
                this.setState(() => {
                    let bookmarks = []
                    return { bookmarks }
                })
            }
        })
    }

    handleBookmark_category(category, bookmark) {
        Axios.get(`${config.api}/changebookmarkcategory.php?id=${bookmark.id}&categoryID=${category.id}`).then(({ data }) => {
            if (data.success) {
                let bookmarks = this.state.bookmarks
                let obj = bookmarks.map((bookmarkItem) => {
                    if (bookmarkItem.id === bookmark.id) {
                        let item = bookmarkItem
                        item.name = category.name

                        return item
                    }

                    return bookmarkItem
                })

                this.setState({ bookmarks: obj })
            }
        })
    }

    /* Star - own class? */
    handleStar_remove(id) {
        Axios.get(`${config.api}/removevideostar.php?videoID=${this.state.video.id}&starID=${id}`).then(({ data }) => {
            if (data.success) {
                let star = { id: 0, name: '' }
                this.setState({ star })
            }
        })
    }

    /* Plays - own class? */
    handlePlays_add() {
        Axios.get(`${config.api}/addplay.php?videoID=${this.state.video.id}`).then(({ data }) => {
            if (data.success) {
                console.log('Play Added')
            }
        })
    }

    handlePlays_reset() {
        Axios.get(`${config.api}/removeplays.php?videoID=${this.state.video.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let { video } = prevState
                    video.plays = 0

                    return { video }
                })
            }
        })
    }

    /* Date - own class */
    handleDate_fix() {
        Axios.get(`${config.api}/fixvideodate.php?id=${this.state.video.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let { date } = prevState.video
                    date.published = data.date

                    let { loaded } = prevState
                    loaded.star = false

                    return { date, loaded }
                })

                this.getData()
            }
        })
    }

    /* Attribute - own class */
    handleAttribute_add(attribute) {
        Axios.get(`${config.api}/addattribute.php?videoID=${this.state.video.id}&attributeID=${attribute.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let { attributes } = prevState.video
                    attributes.push({ id: data.id, name: attribute.name })

                    attributes.sort((a, b) => {
                        return a.name.localeCompare(b.name)
                    })

                    let { video } = prevState
                    video.attributes = attributes

                    return { video }
                })
            }
        })
    }

    handleAttribute_remove(attribute) {
        Axios.get(`${config.api}/removeattribute.php?id=${attribute.id}`).then(({ data }) => {
            if (data.success) {
                let attributes = this.state.video.attributes.filter((item) => {
                    return item.id !== attribute.id
                })

                let video = this.state.video
                video.attributes = attributes

                this.setState({ video })
            }
        })
    }

    /* Location - own class */
    handleLocation_add(location) {
        Axios.get(`${config.api}/addlocation.php?videoID=${this.state.video.id}&locationID=${location.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let { locations } = prevState.video
                    locations.push({ id: data.id, name: location.name })

                    locations.sort((a, b) => {
                        return a.name.localeCompare(b.name)
                    })

                    let { video } = prevState
                    video.locations = locations

                    return { video }
                })
            }
        })
    }

    handleLocation_remove(location) {
        Axios.get(`${config.api}/removelocation.php?id=${location.id}`).then(({ data }) => {
            if (data.success) {
                let locations = this.state.video.locations.filter((item) => {
                    return item.id !== location.id
                })

                let video = this.state.video
                video.locations = locations

                this.setState({ video })
            }
        })
    }

    handleKeyPress(key, e) {
        e.preventDefault()

        switch (key) {
            case 'left':
                this.handleVideo_rewind()
                break
            case 'right':
                this.handleVideo_forward()
                break
            case 'space':
                this.handleVideo_playpause()
                break
            case 'tab':
                // TODO use state instead of window
                if (this.state.video.nextID) {
                    window.location.href = this.state.video.nextID
                }

                break
            default:
                console.log(`${key} was pressed`)
        }
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
                                            this.handleModal(
                                                'Change Title',
                                                <input
                                                    type='text'
                                                    className='text-center'
                                                    defaultValue={this.state.video.name}
                                                    onChange={(e) => this.handleInput(e, 'title')}
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
                                                this.state.attributes
                                                    .filter((item) => {
                                                        let match = this.state.video.attributes.some(
                                                            (videoAttribute) => videoAttribute.name === item.name
                                                        )

                                                        if (!match) return item
                                                        return null
                                                    })
                                                    .map((item, i) => {
                                                        return (
                                                            <div
                                                                key={i}
                                                                className='btn btn-sm btn-outline-primary d-block'
                                                                onClick={() => {
                                                                    this.handleModal()
                                                                    this.handleAttribute_add(item)
                                                                }}
                                                            >
                                                                {item.name}
                                                            </div>
                                                        )
                                                    })
                                            )
                                        }}
                                    >
                                        <i className={`${config.theme.fa} fa-tag`} /> Add Attribute
                                    </MenuItem>

                                    <MenuItem
                                        onClick={() => {
                                            this.handleModal(
                                                'Add Location',
                                                this.state.locations
                                                    .filter((item) => {
                                                        let match = this.state.video.locations.some(
                                                            (videoLocation) => videoLocation.name === item.name
                                                        )

                                                        if (!match) return item
                                                        return null
                                                    })
                                                    .map((item, i) => {
                                                        return (
                                                            <div
                                                                key={i}
                                                                className='btn btn-sm btn-outline-primary d-block'
                                                                onClick={() => {
                                                                    this.handleModal()
                                                                    this.handleLocation_add(item)
                                                                }}
                                                            >
                                                                {item.name}
                                                            </div>
                                                        )
                                                    })
                                            )
                                        }}
                                    >
                                        <i className={`${config.theme.fa} fa-map-marker-alt`} /> Add Location
                                    </MenuItem>

                                    <MenuItem divider />

                                    <MenuItem onClick={() => this.handleTitle_copy()}>
                                        <i className={`${config.theme.fa} fa-copy`} /> Copy Title
                                    </MenuItem>

                                    <MenuItem onClick={() => this.handleStar_copy()}>
                                        <i className={`${config.theme.fa} fa-user`} /> Copy Star
                                    </MenuItem>
                                </ContextMenu>
                            </h1>

                            <div className='header__date btn btn-sm btn-outline-primary'>
                                <ContextMenuTrigger id='menu__date'>
                                    <i className={`${config.theme.fa} fa-calendar-check`} />
                                    {this.state.video.date.published}
                                </ContextMenuTrigger>

                                <ContextMenu id='menu__date'>
                                    <MenuItem onClick={() => this.handleDate_fix()}>
                                        <i className={`${config.theme.fa} fa-edit`} /> Fix Date
                                    </MenuItem>
                                </ContextMenu>
                            </div>

                            <div className='header__locations'>
                                {this.state.loaded.video &&
                                    this.state.video.locations.map((item, i) => (
                                        <div key={i} className='btn btn-sm btn-outline-danger location'>
                                            <ContextMenuTrigger id={`location-${i}`}>
                                                <i className={`${config.theme.fa} fa-map-marker-alt`} />
                                                {item.name}
                                            </ContextMenuTrigger>

                                            <ContextMenu id={`location-${i}`}>
                                                <MenuItem onClick={() => this.handleLocation_remove(item)}>
                                                    <i className={`${config.theme.fa} fa-trash-alt`} /> Remove
                                                </MenuItem>
                                            </ContextMenu>
                                        </div>
                                    ))}
                            </div>

                            <div className='header__attributes'>
                                {this.state.loaded.video &&
                                    this.state.video.attributes.map((item, i) => (
                                        <div key={i} className='btn btn-sm btn-outline-primary attribute'>
                                            <ContextMenuTrigger id={`attribute-${i}`}>
                                                <i className={`${config.theme.fa} fa-tag`} />
                                                {item.name}
                                            </ContextMenuTrigger>

                                            <ContextMenu id={`attribute-${i}`}>
                                                <MenuItem onClick={() => this.handleAttribute_remove(item)}>
                                                    <i className={`${config.theme.fa} fa-trash-alt`} /> Remove
                                                </MenuItem>
                                            </ContextMenu>
                                        </div>
                                    ))}
                            </div>

                            <div className='header__site'>
                                <span className='wsite'>{this.state.video.website}</span>
                                {this.state.video.subsite && (
                                    <React.Fragment>
                                        <span className='divider'>-</span>
                                        <span className='site'>{this.state.video.subsite}</span>
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
                                        keyboard: { focused: false },
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
                                        this.state.categories.map((item, i) => {
                                            return (
                                                <div
                                                    key={i}
                                                    className='btn btn-sm btn-outline-primary d-block'
                                                    onClick={() => {
                                                        this.handleModal()
                                                        this.handleBookmark_add(item)
                                                    }}
                                                >
                                                    {item.name}
                                                </div>
                                            )
                                        })
                                    )
                                }}
                            >
                                <i className={`${config.theme.fa} fa-plus`} /> Add Bookmark
                            </MenuItem>

                            <MenuItem
                                disabled={!!this.state.star.ageInVideo}
                                onClick={() => {
                                    this.handleModal(
                                        'Set Age',
                                        <input
                                            type='number'
                                            className='text-center'
                                            onChange={(e) => this.handleInput(e, 'age')}
                                            ref={(input) => input && input.focus()}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()

                                                    this.handleModal()
                                                    this.handleVideo_setAge()
                                                }
                                            }}
                                        />
                                    )
                                }}
                            >
                                <i className={`${config.theme.fa} fa-plus`} /> Set Age
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    this.handleModal(
                                        'Rename Video',
                                        <input
                                            type='text'
                                            className='text-center'
                                            defaultValue={this.state.video.path.file}
                                            onChange={(e) => this.handleInput(e, 'video')}
                                            ref={(input) => input && input.focus()}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()

                                                    this.handleModal()
                                                    this.handleVideo_rename()
                                                }
                                            }}
                                        />
                                    )
                                }}
                            >
                                <i className={`${config.theme.fa} fa-edit`} /> Rename File
                            </MenuItem>

                            <MenuItem disabled>
                                <i className={`${config.theme.fa} fa-edit`} /> Fix Thumbnails
                            </MenuItem>

                            <MenuItem divider />

                            <MenuItem onClick={() => this.handleBookmark_clear()}>
                                <i className={`${config.theme.fa} fa-trash-alt`} /> Remove Bookmarks
                            </MenuItem>

                            <MenuItem onClick={() => this.handlePlays_reset()}>
                                <i className={`${config.theme.fa} fa-trash-alt`} /> Remove Plays
                            </MenuItem>

                            <MenuItem disabled={this.state.star.id > 0} onClick={() => this.handleVideo_delete()}>
                                <i className={`${config.theme.fa} fa-trash-alt`} /> Remove Video
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
                            this.state.bookmarks.map((bookmarkItem, i) => (
                                <React.Fragment key={i}>
                                    <div
                                        className='btn btn-sm btn-outline-primary bookmark'
                                        style={{
                                            left: `${((bookmarkItem.start * 100) / this.state.video.duration) * config.timeline.offset}%`,
                                        }}
                                        onClick={() => this.handleVideo_play(bookmarkItem.start)}
                                        ref={(bookmark) => (this.bookmarks[i] = bookmark)}
                                        data-level={i}
                                    >
                                        <ContextMenuTrigger id={`bookmark-${i}`}>{bookmarkItem.name}</ContextMenuTrigger>
                                    </div>

                                    <ContextMenu id={`bookmark-${i}`}>
                                        <MenuItem
                                            onClick={() => {
                                                this.handleModal(
                                                    'Change Category',
                                                    this.state.categories
                                                        .filter((categoryItem) => {
                                                            return categoryItem.name !== bookmarkItem.name
                                                        })
                                                        .map((categoryItem, category_i) => {
                                                            return (
                                                                <div
                                                                    key={category_i}
                                                                    className='btn btn-sm btn-outline-primary d-block w-auto'
                                                                    onClick={() => {
                                                                        this.handleModal()
                                                                        this.handleBookmark_category(categoryItem, bookmarkItem)
                                                                    }}
                                                                >
                                                                    {categoryItem.name}
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
                                                this.state.categories.map((item, i) => {
                                                    return (
                                                        <div
                                                            key={i}
                                                            className='btn btn-sm btn-outline-primary d-block w-auto'
                                                            onClick={() => {
                                                                this.handleModal()
                                                                this.handleBookmark_add(item)
                                                            }}
                                                        >
                                                            {item.name}
                                                        </div>
                                                    )
                                                })
                                            )
                                        }}
                                    >
                                        <i className={`${config.theme.fa} fa-plus`} /> Add Bookmark
                                    </MenuItem>

                                    <MenuItem divider />

                                    <MenuItem onClick={() => this.handleStar_remove(this.state.star.id)}>
                                        <i className={`${config.theme.fa} fa-trash-alt`} /> Remove
                                    </MenuItem>
                                </ContextMenu>
                            </div>
                        )}
                    </div>
                </aside>

                <Modal visible={this.state.modal.visible} onClose={() => this.handleModal()} title={this.state.modal.title}>
                    {this.state.modal.data}
                </Modal>

                <KeyboardEventHandler
                    handleKeys={['left', 'right', 'space', 'tab']}
                    onKeyEvent={(key, e) => this.handleKeyPress(key, e)}
                    handleFocusableElements={true}
                    isDisabled={this.state.modal.visible}
                />
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
                if (Number(localStorage.video) !== this.state.video.id) {
                    localStorage.playing = 0
                }

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
                    let { loaded } = prevState
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
                        if (Number(localStorage.playing)) this.handleVideo_play(localStorage.bookmark)

                        this.setState({ newVideo: false })
                    } else {
                        localStorage.video = this.state.video.id
                        localStorage.bookmark = 0

                        hls.startLoad()
                        this.handleVideo_pause()

                        this.setState({ newVideo: true })
                    }
                })

                this.setState((prevState) => {
                    let { loaded } = prevState
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
        const { id } = this.props.match.params
        const { loaded } = this.state

        if (!loaded.video) {
            Axios.get(`${config.api}/video.php?id=${id}`).then(({ data: video }) => {
                    this.setState((prevState) => {
                    let { loaded } = prevState
                        loaded.video = true

                    return { video, loaded }
                    })
                })
        }

        if (!loaded.bookmarks) {
            Axios.get(`${config.api}/bookmarks.php?id=${id}`).then(({ data: bookmarks }) => {
                    this.setState((prevState) => {
                    let { loaded } = prevState
                        loaded.bookmarks = true

                    return { bookmarks, loaded }
                    })
                })
        }

        if (!loaded.star) {
            Axios.get(`${config.api}/stars.php?videoID=${id}`).then(({ data: star }) => {
                    this.setState((prevState) => {
                    let { loaded } = prevState
                        loaded.star = true

                    return { star, loaded }
                    })
                })
        }

        if (!loaded.categories) {
            Axios.get(`${config.api}/categories.php`).then(({ data: categories }) => {
                    this.setState((prevState) => {
                    let { loaded } = prevState
                        loaded.categories = true

                    return { categories, loaded }
                    })
                })
        }

        if (!loaded.attributes) {
            Axios.get(`${config.api}/attributes.php`).then(({ data: attributes }) => {
                    this.setState((prevState) => {
                    let { loaded } = prevState
                        loaded.attributes = true

                    return { attributes, loaded }
                    })
                })
        }

        if (!loaded.locations) {
            Axios.get(`${config.api}/locations.php`).then(({ data: locations }) => {
                    this.setState((prevState) => {
                    let { loaded } = prevState
                        loaded.locations = true

                    return { locations, loaded }
                    })
                })
        }
    }
}

export default VideoPage
