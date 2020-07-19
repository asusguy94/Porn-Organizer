import React, { Component } from 'react'

import Axios from 'axios'

import { DaysToYears } from './../date'

import '../styles/search.scss'

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
                categories: [],
                attributes: [],
                locations: [],
                hidden: {
                    category: [],
                    attribute: [],
                    titleSearch: [],
                    noCategory: false,
                },
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

        location: [
            {
                id: 0,
                name: '',
            },
        ],

        loaded: {
            videos: false,

            categories: false,
            attributes: false,
        },
    }

    getCount() {
        let count = 0
        this.state.videos.forEach(({ hidden }) => {
            count +=
                !hidden.category.length &&
                !hidden.attribute.length &&
                !hidden.location.length &&
                !hidden.titleSearch &&
                !hidden.noCategory
        })
        return count
    }

    isHidden({ hidden }) {
        return hidden.category.length || hidden.attribute.length || hidden.location.length || hidden.titleSearch || hidden.noCategory
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

                console.log(video.hidden.location)

                if (match && !video.hidden.location.includes(targetLower)) {
                    video.hidden.location.push(targetLower)
                }
            }
            return video
        })
        this.setState({ videos })
    }

    sort_asc() {
        let videos = this.state.videos
        videos.sort((a, b) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return valA.localeCompare(valB)
        })

        this.setState({ videos })
    }

    sort_desc() {
        let videos = this.state.videos
        videos.sort((a, b) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return valB.localeCompare(valA)
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
                        <input id='alphabetically' type='radio' name='sort' onChange={this.sort_asc.bind(this)} defaultChecked />
                        <label htmlFor='alphabetically'>A-Z</label>
                    </div>
                    <div className='input-wrapper'>
                        <input id='alphabetically_desc' type='radio' name='sort' onChange={this.sort_desc.bind(this)} />
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

                    <div className='input-wrapper disabled'>
                        <input id='popularity_desc' type='radio' name='sort' />
                        <label htmlFor='popularity_desc'>Most Popular</label>
                    </div>
                    <div className='input-wrapper disabled'>
                        <input id='popularity_asc' type='radio' name='sort' />
                        <label htmlFor='popularity_asc'>Least Popular</label>
                    </div>

                    <h2>Categories</h2>
                    <div id='categories'>
                        <div className='input-wrapper'>
                            <input
                                type='checkbox'
                                id='category_NULL'
                                data-state='0'
                                onChange={(e) => this.handleCategoryFilter(e, null)}
                            />
                            <label htmlFor='category_NULL'>NULL</label>
                        </div>
                        {this.state.loaded.categories &&
                            Object.keys(this.state.categories).map((i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='checkbox'
                                        id={`category-${this.state.categories[i].name}`}
                                        data-state='0'
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
                                        data-state='0'
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
                                        data-state='0'
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
                                    className={`video ribbon-container card ${this.isHidden(this.state.videos[i]) && 'd-none'}`}
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
            </div>
        )
    }

    componentDidMount() {
        this.getData()
    }

    getData() {
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
                        }

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

export default VideoSearchPage
