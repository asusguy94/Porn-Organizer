import React, { Component } from 'react'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'

import { DaysToYears } from '../date/date'

import './search.scss'

import config from '../config'

class VideoSearchPage extends Component {
    state = {
        videos: [
            {
                id: 0,
                date: '',
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
            for (const prop in hidden) {
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

        const videos = this.state.videos.map((item) => {
            item.hidden.titleSearch = !item.name.toLowerCase().includes(searchValue)

            return item
        })

        this.setState({ videos })
    }

    handleCategoryFilter(e, target) {
        const videos = this.state.videos.map((video) => {
            if (target === null) {
                video.hidden.noCategory = e.target.checked && video.categories.length
            } else {
                const targetLower = target.name.toLowerCase()

                if (!e.target.checked) {
                    video.hidden.noCategory = false
                    const match = !video.categories
                        .map((category) => {
                            return category.toLowerCase()
                        })
                        .includes(targetLower)

                    if (match) {
                        const index = video.hidden.category.indexOf(targetLower)
                        video.hidden.category.splice(index, 1)
                    }
                } else {
                    const match = !video.categories
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
        const videos = this.state.videos.map((video) => {
            video.hidden.pov = e.target.checked && !video.pov

            return video
        })

        this.setState({ videos })
    }

    handleAttributeFilter(e, target) {
        const targetLower = target.name.toLowerCase()

        const videos = this.state.videos.map((video) => {
            if (!e.target.checked) {
                const match = !video.attributes
                    .map((attribute) => {
                        return attribute.toLowerCase()
                    })
                    .includes(targetLower)

                if (match) {
                    const index = video.hidden.attribute.indexOf(targetLower)
                    video.hidden.attribute.splice(index, 1)
                }
            } else {
                const match = !video.attributes
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

        const videos = this.state.videos.map((video) => {
            if (!e.target.checked) {
                const match = !video.locations
                    .map((location) => {
                        return location.toLowerCase()
                    })
                    .includes(targetLower)

                if (match) {
                    const index = video.hidden.location.indexOf(targetLower)
                    video.hidden.location.splice(index, 1)
                }
            } else {
                const match = !video.locations
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

        const videos = this.state.videos.map((video) => {
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
        const videos = this.state.videos
        videos.sort((a, b) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return valA.localeCompare(valB)
        })

        this.setState({ videos })
    }

    sort_default_desc() {
        const videos = this.state.videos
        videos.sort((b, a) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return valA.localeCompare(valB)
        })

        this.setState({ videos })
    }

    sort_plays_asc() {
        const videos = this.state.videos
        videos.sort((a, b) => {
            let valA = a.plays
            let valB = b.plays

            return valA - valB
        })
        this.setState({ videos })
    }

    sort_plays_desc() {
        const videos = this.state.videos
        videos.sort((b, a) => {
            let valA = a.plays
            let valB = b.plays

            return valA - valB
        })
        this.setState({ videos })
    }

    sort_age_asc() {
        const videos = this.state.videos
        videos.sort((a, b) => {
            let valA = a.ageInVideo
            let valB = b.ageInVideo

            return valA - valB
        })
        this.setState({ videos })
    }

    sort_age_desc() {
        const videos = this.state.videos
        videos.sort((b, a) => {
            let valA = a.ageInVideo
            let valB = b.ageInVideo

            return valA - valB
        })
        this.setState({ videos })
    }

    sort_added_asc() {
        const videos = this.state.videos
        videos.sort((a, b) => {
            let valA = a.id
            let valB = b.id

            return valA - valB
        })

        this.setState({ videos })
    }

    sort_added_desc() {
        const videos = this.state.videos
        videos.sort((b, a) => {
            let valA = a.id
            let valB = b.id

            return valA - valB
        })

        this.setState({ videos })
    }

    sort_date_asc() {
        const videos = this.state.videos
        videos.sort((a, b) => {
            let valA = new Date(a.date)
            let valB = new Date(b.date)

            return valA - valB
        })

        this.setState({ videos })
    }

    sort_date_desc() {
        const videos = this.state.videos
        videos.sort((b, a) => {
            let valA = new Date(a.date)
            let valB = new Date(b.date)

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

                    <div className='input-wrapper'>
                        <input id='added_desc' type='radio' name='sort' onChange={this.sort_added_asc.bind(this)} />
                        <label htmlFor='added_desc'>Old Upload</label>
                    </div>
                    <div className='input-wrapper'>
                        <input id='added_asc' type='radio' name='sort' onChange={this.sort_added_desc.bind(this)} />
                        <label htmlFor='added_asc'>New Upload</label>
                    </div>

                    <div className='input-wrapper'>
                        <input id='date_desc' type='radio' name='sort' onChange={this.sort_date_asc.bind(this)} />
                        <label htmlFor='date_desc'>Oldest</label>
                    </div>
                    <div className='input-wrapper'>
                        <input id='date_asc' type='radio' name='sort' onChange={this.sort_date_desc.bind(this)} />
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
                                {this.state.websites.map((item, i) => (
                                    <option key={i}>{item.name}</option>
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
                            this.state.categories.map((item, i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='checkbox'
                                        id={`category-${item.name}`}
                                        onChange={(e) => this.handleCategoryFilter(e, item)}
                                    />
                                    <label htmlFor={`category-${item.name}`}>{item.name}</label>
                                </div>
                            ))}
                    </div>

                    <h2>Attributes</h2>
                    <div id='attributes'>
                        {this.state.loaded.attributes &&
                            this.state.attributes.map((item, i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='checkbox'
                                        id={`attribute-${item.name}`}
                                        onChange={(e) => this.handleAttributeFilter(e, item)}
                                    />
                                    <label htmlFor={`attribute-${item.name}`}>{item.name}</label>
                                </div>
                            ))}
                    </div>

                    <h2>Locations</h2>
                    <div id='attributes'>
                        {this.state.loaded.locations &&
                            this.state.locations.map((item, i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='checkbox'
                                        id={`attribute-${item.name}`}
                                        onChange={(e) => this.handleLocationFilter(e, item)}
                                    />
                                    <label htmlFor={`attribute-${item.name}`}>{item.name}</label>
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
                            this.state.videos.map((item, i) => (
                                <a
                                    key={i}
                                    className={`video ribbon-container card ${this.isHidden(item) ? 'd-none' : ''}`}
                                    href={`/video/${this.state.videos[i].id}`}
                                >
                                    <img className='card-img-top' src={`${config.source}/images/videos/${item.id}-290`} alt='video' />

                                    <span className='title card-title text-center'>{item.name}</span>

                                    <span className='ribbon'>
                                        <DaysToYears>{item.ageInVideo}</DaysToYears>
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

        document.title = 'Video Search'
    }

    getData() {
        const { loaded } = this.state

        if (!loaded.videos) {
            Axios.get(`${config.api}/videosearch.php`).then(({ data: { videos } }) => {
                this.setState((prevState) => {
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

                        item.pov = item.categories.length && item.categories.every((category) => category.includes('(POV)'))

                        return item
                    })

                    const { loaded } = prevState
                    loaded.videos = true

                    return { videos, loaded }
                })
            })
        }

        if (!loaded.categories) {
            Axios.get(`${config.api}/categories.php`).then(({ data: categories }) => {
                this.setState((prevState) => {
                    const { loaded } = prevState
                    loaded.categories = true

                    return { categories, loaded }
                })
            })
        }

        if (!loaded.attributes) {
            Axios.get(`${config.api}/attributes.php`).then(({ data: attributes }) => {
                this.setState((prevState) => {
                    const { loaded } = prevState
                    loaded.attributes = true

                    return { attributes, loaded }
                })
            })
        }

        if (!loaded.locations) {
            Axios.get(`${config.api}/locations.php`).then(({ data: locations }) => {
                this.setState((prevState) => {
                    const { loaded } = prevState
                    loaded.locations = true

                    return { locations, loaded }
                })
            })
        }

        if (!loaded.websites) {
            Axios.get(`${config.api}/websites.php`).then(({ data: websites }) => {
                this.setState((prevState) => {
                    const { loaded } = prevState
                    loaded.websites = true

                    return { websites, loaded }
                })
            })
        }
    }
}

export default VideoSearchPage
