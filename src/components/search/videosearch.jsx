import React, { Component } from 'react'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'

import { DaysToYears } from '../date/date'

import './search.scss'

import config from '../config.json'

class VideoSearchPage extends Component {
    state = {
        videos: [
            {
                id: 0,
                name: '',
                star: '',
                ageInVideo: 0,
                website: '',
                site: '',
                plays: 0,
                categories: [],
                attributes: [],
                locations: [],
                hidden: {
                    category: [],
                    attribute: [],
                    titleSearch: false,
                    noCategory: false,
                    pov: false,
                    website: false,
                },
                pov: false,
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

        websites: [
            {
                id: 0,
                name: '',
            },
        ],

        loaded: {
            videos: false,

            categories: false,
            attributes: false,
            websites: false,
        },
    }

    getCount() {
        const obj = this.state.videos
        let count = obj.length

        obj.forEach(({ hidden }) => {
            let value = 0
            for (let prop in hidden) {
                if (typeof hidden[prop] !== 'object') {
                    value += Number(hidden[prop])
                } else {
                    value += Number(hidden[prop].length > 0)
                }
            }
            if (value) count--
        })
        return count
    }

    isHidden({ hidden }) {
        let value = 0
        for (var prop in hidden) {
            if (typeof hidden[prop] !== 'object') {
                value += Number(hidden[prop])
            } else {
                value += Number(hidden[prop].length > 0)
            }
        }

        return value
    }

    handleTitleSearch(e) {
        const searchValue = e.target.value.toLowerCase()

        let videos = this.state.videos.map((item) => {
            item.hidden.titleSearch = !item.name.toLowerCase().includes(searchValue)

            return item
        })

        this.setState({ videos })
    }

    handleCategoryFilter(e, target) {
        let videos = this.state.videos.map((video) => {
            if (target === null) {
                video.hidden.noCategory = e.target.checked && video.categories.length
            } else {
                const targetLower = target.name.toLowerCase()

                if (!e.target.checked) {
                    video.hidden.noCategory = false
                    let match = !video.categories
                        .map((category) => {
                            return category.toLowerCase()
                        })
                        .includes(targetLower)

                    if (match) {
                        let index = video.hidden.category.indexOf(targetLower)
                        video.hidden.category.splice(index, 1)
                    }
                } else {
                    let match = !video.categories
                        .map((category) => {
                            return category.toLowerCase()
                        })
                        .includes(targetLower)

                    if (match && !video.hidden.category.includes(targetLower)) {
                        video.hidden.category.push(targetLower)
                    }
                }
            }
            return video
        })

        this.setState({ videos })
    }

    handleCategoryFilter_POV(e) {
        let videos = this.state.videos.map((video) => {
            video.hidden.pov = e.target.checked && !video.pov

            return video
        })

        this.setState({ videos })
    }

    handleAttributeFilter(e, target) {
        const targetLower = target.name.toLowerCase()

        let videos = this.state.videos.map((video) => {
            if (!e.target.checked) {
                let match = !video.attributes
                    .map((attribute) => {
                        return attribute.toLowerCase()
                    })
                    .includes(targetLower)

                if (match) {
                    let index = video.hidden.attribute.indexOf(targetLower)
                    video.hidden.attribute.splice(index, 1)
                }
            } else {
                let match = !video.attributes
                    .map((attribute) => {
                        return attribute.toLowerCase()
                    })
                    .includes(targetLower)

                if (match && !video.hidden.attribute.includes(targetLower)) {
                    video.hidden.attribute.push(targetLower)
                }
            }
            return video
        })
        this.setState({ videos })
    }

    handleLocationFilter(e, target) {
        const targetLower = target.name.toLowerCase()

        let videos = this.state.videos.map((video) => {
            if (!e.target.checked) {
                let match = !video.locations
                    .map((location) => {
                        return location.toLowerCase()
                    })
                    .includes(targetLower)

                if (match) {
                    let index = video.hidden.location.indexOf(targetLower)
                    video.hidden.location.splice(index, 1)
                }
            } else {
                let match = !video.locations
                    .map((location) => {
                        return location.toLowerCase()
                    })
                    .includes(targetLower)

                if (match && !video.hidden.location.includes(targetLower)) {
                    video.hidden.location.push(targetLower)
                }
            }
            return video
        })
        this.setState({ videos })
    }

    handleWebsiteFilter(e) {
        const targetLower = e.target.value.toLowerCase()

        let videos = this.state.videos.map((video) => {
            if (targetLower === 'all') {
                video.hidden.website = false
            } else {
                video.hidden.website = !(video.website.toLowerCase() === targetLower)
            }

            return video
        })

        this.setState({ videos })
    }

    sort_default_asc() {
        let videos = this.state.videos
        videos.sort((a, b) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return valA.localeCompare(valB)
        })

        this.setState({ videos })
    }

    sort_default_desc() {
        let videos = this.state.videos
        videos.sort((b, a) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return valA.localeCompare(valB)
        })

        this.setState({ videos })
    }

    sort_plays_asc() {
        let videos = this.state.videos
        videos.sort((a, b) => {
            let valA = a.plays
            let valB = b.plays

            return valA - valB
        })
        this.setState({ videos })
    }

    sort_plays_desc() {
        let videos = this.state.videos
        videos.sort((b, a) => {
            let valA = a.plays
            let valB = b.plays

            return valA - valB
        })
        this.setState({ videos })
    }

    sort_age_asc() {
        let videos = this.state.videos
        videos.sort((a, b) => {
            let valA = a.ageInVideo
            let valB = b.ageInVideo

            return valA - valB
        })
        this.setState({ videos })
    }

    sort_age_desc() {
        let videos = this.state.videos
        videos.sort((b, a) => {
            let valA = a.ageInVideo
            let valB = b.ageInVideo

            return valA - valB
        })
        this.setState({ videos })
    }

    render() {
        return (
            <div className='search-page col-12 row'>
                <aside className='col-2'>
                    <div id='update' className='col btn-outline-primary d-none'>
                        Update Data
                    </div>

                    <div className='input-wrapper'>
                        <input type='text' placeholder='Title' autoFocus onChange={this.handleTitleSearch.bind(this)} />
                    </div>

                    <h2>Sort</h2>
                    <div className='input-wrapper'>
                        <input id='alphabetically' type='radio' name='sort' onChange={this.sort_default_asc.bind(this)} defaultChecked />
                        <label htmlFor='alphabetically'>A-Z</label>
                    </div>
                    <div className='input-wrapper'>
                        <input id='alphabetically_desc' type='radio' name='sort' onChange={this.sort_default_desc.bind(this)} />
                        <label htmlFor='alphabetically_desc'>Z-A</label>
                    </div>

                    <div className='input-wrapper disabled'>
                        <input id='added_desc' type='radio' name='sort' />
                        <label htmlFor='added_desc'>Old Upload</label>
                    </div>
                    <div className='input-wrapper disabled'>
                        <input id='added_asc' type='radio' name='sort' />
                        <label htmlFor='added_asc'>New Upload</label>
                    </div>

                    <div className='input-wrapper disabled'>
                        <input id='date_desc' type='radio' name='sort' />
                        <label htmlFor='date_desc'>Oldest</label>
                    </div>
                    <div className='input-wrapper disabled'>
                        <input id='date_asc' type='radio' name='sort' />
                        <label htmlFor='date_asc'>Newest</label>
                    </div>

                    <div className='input-wrapper'>
                        <input id='age_desc' type='radio' name='sort' onChange={this.sort_age_asc.bind(this)} />
                        <label htmlFor='age_desc'>Teen</label>
                    </div>
                    <div className='input-wrapper'>
                        <input id='age_asc' type='radio' name='sort' onChange={this.sort_age_desc.bind(this)} />
                        <label htmlFor='age_asc'>Milf</label>
                    </div>

                    <div className='input-wrapper'>
                        <input id='popularity_desc' type='radio' name='sort' onChange={this.sort_plays_desc.bind(this)} />
                        <label htmlFor='popularity_desc'>Most Popular</label>
                    </div>
                    <div className='input-wrapper'>
                        <input id='popularity_asc' type='radio' name='sort' onChange={this.sort_plays_asc.bind(this)} />
                        <label htmlFor='popularity_asc'>Least Popular</label>
                    </div>

                    <h2>Websites</h2>
                    <div className='websites'>
                        {this.state.loaded.websites && (
                            <select className='form-control' onChange={(e) => this.handleWebsiteFilter(e)}>
                                <option className='global-category'>ALL</option>
                                {Object.keys(this.state.websites).map((i) => (
                                    <option key={i}>{this.state.websites[i].name}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    <h2>Categories</h2>
                    <div id='categories'>
                        <div className='input-wrapper'>
                            <input type='checkbox' id='category_POV' onChange={(e) => this.handleCategoryFilter_POV(e)} />
                            <label htmlFor='category_POV' className='global-category'>
                                POV
                            </label>
                        </div>

                        <div className='input-wrapper'>
                            <input type='checkbox' id='category_NULL' onChange={(e) => this.handleCategoryFilter(e, null)} />
                            <label htmlFor='category_NULL' className='global-category'>
                                NULL
                            </label>
                        </div>

                        {this.state.loaded.categories &&
                            Object.keys(this.state.categories).map((i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='checkbox'
                                        id={`category-${this.state.categories[i].name}`}
                                        onChange={(e) => this.handleCategoryFilter(e, this.state.categories[i])}
                                    />
                                    <label htmlFor={`category-${this.state.categories[i].name}`}>{this.state.categories[i].name}</label>
                                </div>
                            ))}
                    </div>

                    <h2>Attributes</h2>
                    <div id='attributes'>
                        {this.state.loaded.attributes &&
                            Object.keys(this.state.attributes).map((i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='checkbox'
                                        id={`attribute-${this.state.attributes[i].name}`}
                                        onChange={(e) => this.handleAttributeFilter(e, this.state.attributes[i])}
                                    />
                                    <label htmlFor={`attribute-${this.state.attributes[i].name}`}>{this.state.attributes[i].name}</label>
                                </div>
                            ))}
                    </div>

                    <h2>Locations</h2>
                    <div id='attributes'>
                        {this.state.loaded.locations &&
                            Object.keys(this.state.locations).map((i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='checkbox'
                                        id={`attribute-${this.state.locations[i].name}`}
                                        onChange={(e) => this.handleLocationFilter(e, this.state.locations[i])}
                                    />
                                    <label htmlFor={`attribute-${this.state.locations[i].name}`}>{this.state.locations[i].name}</label>
                                </div>
                            ))}
                    </div>
                </aside>

                <section id='videos' className='col-10'>
                    {this.state.loaded.videos && (
                        <h2 className='text-center'>
                            <span className='count'>{this.getCount()}</span> Videos
                        </h2>
                    )}

                    <div className='row justify-content-center'>
                        {this.state.loaded.videos && this.state.videos[0].id !== 0 ? (
                            Object.keys(this.state.videos).map((i) => (
                                <a
                                    key={i}
                                    className={`video ribbon-container card ${this.isHidden(this.state.videos[i]) ? 'd-none' : ''}`}
                                    href={`/video/${this.state.videos[i].id}`}
                                >
                                    <img
                                        className='card-img-top'
                                        src={`${config.source}/images/videos/${this.state.videos[i].id}-290`}
                                        alt='video'
                                    />

                                    <span className='title card-title text-center'>{this.state.videos[i].name}</span>

                                    <span className='ribbon'>
                                        <DaysToYears>{this.state.videos[i].ageInVideo}</DaysToYears>
                                    </span>
                                </a>
                            ))
                        ) : (
                            <div id='loader'></div>
                        )}
                    </div>
                </section>

                <ScrollToTop smooth />
            </div>
        )
    }

    componentDidMount() {
        this.getData()
    }

    getData() {
        const { loaded } = this.state

        if (!loaded.videos) {
            Axios.get(`${config.api}/videosearch.php`)
                .then(({ data: { videos } }) => {
                    this.setState(() => {
                        videos = videos.map((item) => {
                            item.hidden = {
                                category: [],
                                attribute: [],
                                location: [],
                                titleSearch: false,
                                noCategory: false,
                                pov: false,
                                website: false,
                            }

                            let match = 0
                            item.categories.forEach((category) => {
                                match += category.includes('(POV)')
                            })

                            item.pov = match && match === item.categories.length

                            return item
                        })

                        return { videos }
                    })
                })
                .then(() => {
                    this.setState((prevState) => {
                        let loaded = prevState.loaded
                        loaded.videos = true

                        return { loaded }
                    })
                })
        }

        if (!loaded.categories) {
            Axios.get(`${config.api}/categories.php`)
                .then(({ data: categories }) => this.setState({ categories }))
                .then(() => {
                    this.setState((prevState) => {
                        let loaded = prevState.loaded
                        loaded.categories = true

                        return { loaded }
                    })
                })
        }

        if (!loaded.attributes) {
            Axios.get(`${config.api}/attributes.php`)
                .then(({ data: attributes }) => this.setState({ attributes }))
                .then(() => {
                    this.setState((prevState) => {
                        let loaded = prevState.loaded
                        loaded.attributes = true

                        return { loaded }
                    })
                })
        }

        if (!loaded.locations) {
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

        if (!loaded.websites) {
            Axios.get(`${config.api}/websites.php`)
                .then(({ data: websites }) => this.setState({ websites }))
                .then(() => {
                    this.setState((prevState) => {
                        let loaded = prevState.loaded
                        loaded.websites = true

                        return { loaded }
                    })
                })
        }
    }
}

export default VideoSearchPage
