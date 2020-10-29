import React, { Component } from 'react'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'

import { DaysToYears } from '../date/date'
import LabelCount from '../labelcount/labelcount'

import './search.scss'

import config from '../config'

class StarSearchPage extends Component {
    state = {
        stars: [
            {
                starID: 0,
                starName: '',
                image: '',
                breast: '',
                eyecolor: '',
                haircolor: '',
                ethnicity: '',
                age: '',
                country: '',
                videoCount: '',
                websites: [],
                sites: [],
                hidden: {
                    titleSearch: [],

                    breast: false,
                    haircolor: false,
                    ethnicity: false,
                    country: false,

                    noBreast: false,
                },
            },
        ],

        breasts: [],
        haircolors: [],
        ethnicities: [],
        countries: [],

        loaded: {
            stars: false,

            breasts: false,
            haircolors: false,
            ethnicities: false,
            countries: false,
        },
    }

    getCount() {
        const obj = this.state.stars
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

        const stars = this.state.stars.map((item) => {
            item.hidden.titleSearch = !item.name.toLowerCase().includes(searchValue)

            return item
        })

        this.setState({ stars })
    }

    handleBreastFilter(e, target) {
        let stars = this.state.stars.map((star) => {
            star.hidden.breast = false
            star.hidden.noBreast = false
            if (target === null) {
                star.hidden.noBreast = e.target.checked && star.breast.length
            } else {
                let match = star.breast.toLowerCase() !== target.toLowerCase()

                star.hidden.breast = match
            }

            return star
        })
        this.setState({ stars })
    }

    handleBreastFilter_ALL() {
        let stars = this.state.stars.map((star) => {
            star.hidden.breast = false
            star.hidden.noBreast = false

            return star
        })

        this.setState({ stars })
    }

    handleHaircolorFilter(target) {
        let stars = this.state.stars.map((star) => {
            star.hidden.haircolor = star.haircolor.toLowerCase() !== target.toLowerCase()

            return star
        })
        this.setState({ stars })
    }

    handleHaircolorFilter_ALL() {
        let stars = this.state.stars.map((star) => {
            star.hidden.haircolor = false

            return star
        })

        this.setState({ stars })
    }

    handleEthnicityFilter(target) {
        let stars = this.state.stars.map((star) => {
            star.hidden.ethnicity = star.ethnicity.toLowerCase() !== target.toLowerCase()

            return star
        })
        this.setState({ stars })
    }

    handleEthnicityFilter_ALL() {
        let stars = this.state.stars.map((star) => {
            star.hidden.ethnicity = false

            return star
        })

        this.setState({ stars })
    }

    handleCountryFilter(e) {
        const targetLower = e.target.value.toLowerCase()

        const stars = this.state.stars.map((star) => {
            if (targetLower === 'all') {
                star.hidden.country = false
            } else {
                star.hidden.country = !(star.country.toLowerCase() === targetLower)
            }

            return star
        })

        this.setState({ stars })
    }

    sort_default_asc() {
        const stars = this.state.stars
        stars.sort((a, b) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return valA.localeCompare(valB, 'en')
        })

        this.setState({ stars })
    }

    sort_default_desc() {
        const stars = this.state.stars
        stars.sort((b, a) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return valA.localeCompare(valB, 'en')
        })

        this.setState({ stars })
    }

    sort_added_asc() {}
    sort_added_desc() {}

    sort_age_asc() {
        const { stars } = this.state
        stars.sort((a, b) => {
            let valA = a.age
            let valB = b.age

            return valA - valB
        })

        this.setState({ stars })
    }
    sort_age_desc() {
        const { stars } = this.state
        stars.sort((b, a) => {
            let valA = a.age
            let valB = b.age

            return valA - valB
        })

        this.setState({ stars })
    }

    sort_videos_asc() {
        const { stars } = this.state
        stars.sort((a, b) => {
            let valA = a.videoCount
            let valB = b.videoCount

            return valA - valB
        })

        this.setState({ stars })
    }
    sort_videos_desc() {
        const { stars } = this.state
        stars.sort((b, a) => {
            let valA = a.videoCount
            let valB = b.videoCount

            return valA - valB
        })

        this.setState({ stars })
    }

    render() {
        return (
            <div className='search-page col-12 row'>
                <aside className='col-2'>
                    <div id='update' className='col btn-outline-primary d-none'>
                        Update Data
                    </div>

                    <div className='input-wrapper'>
                        <input type='text' placeholder='Name' autoFocus onChange={this.handleTitleSearch.bind(this)} />
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
                        <input id='added' type='radio' name='sort' onChange={this.sort_added_asc.bind(this)} />
                        <label htmlFor='added'>Old Upload</label>
                    </div>
                    <div className='input-wrapper disabled'>
                        <input id='added_desc' type='radio' name='sort' onChange={this.sort_added_desc.bind(this)} />
                        <label htmlFor='added_desc'>Recent Upload</label>
                    </div>

                    <div className='input-wrapper'>
                        <input id='actor-age' type='radio' name='sort' onChange={this.sort_age_asc.bind(this)} />
                        <label htmlFor='actor-age'>Teen</label>
                    </div>
                    <div className='input-wrapper'>
                        <input id='actor-age_desc' type='radio' name='sort' onChange={this.sort_age_desc.bind(this)} />
                        <label htmlFor='actor-age_desc'>Milf</label>
                    </div>

                    <div className='input-wrapper'>
                        <input id='videocount' type='radio' name='sort' onChange={this.sort_videos_asc.bind(this)} />
                        <label htmlFor='videocount'>Least Videos</label>
                    </div>
                    <div className='input-wrapper'>
                        <input id='videocount_desc' type='radio' name='sort' onChange={this.sort_videos_desc.bind(this)} />
                        <label htmlFor='videocount_desc'>Most Videos</label>
                    </div>

                    <h2 className='h5'>Websites/Sites</h2>
                    <div id='websites' className='input-wrapper'></div>

                    <h2 className='h5'>Exclude Websites</h2>
                    <div id='websites-exclude' className='input-wrapper'></div>

                    <h2>Breast</h2>
                    <div id='breasts'>
                        <div className='input-wrapper'>
                            <input
                                type='radio'
                                id='breast_ALL'
                                name='breast'
                                defaultChecked
                                onChange={() => this.handleBreastFilter_ALL()}
                            />
                            <label htmlFor='breast_ALL' className='global-category'>
                                All
                            </label>
                        </div>

                        <div className='input-wrapper'>
                            <input type='radio' id='breast_NULL' name='breast' onChange={(e) => this.handleBreastFilter(e, null)} />
                            <label htmlFor='breast_NULL' className='global-category'>
                                NULL
                            </label>
                        </div>

                        {this.state.loaded.breasts &&
                            Object.keys(this.state.breasts).map((i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='radio'
                                        name='breast'
                                        id={`category-${this.state.breasts[i]}`}
                                        onChange={(e) => this.handleBreastFilter(e, this.state.breasts[i])}
                                    />
                                    <label htmlFor={`category-${this.state.breasts[i]}`}>
                                        {this.state.breasts[i]}{' '}
                                        <LabelCount
                                            prop='breast'
                                            label={this.state.breasts[i]}
                                            obj={this.state.stars}
                                            isArr={true}
                                            isHidden={this.isHidden}
                                        />
                                    </label>
                                </div>
                            ))}
                    </div>

                    <h2>Hair Color</h2>
                    <div id='haircolors'>
                        <div className='input-wrapper'>
                            <input
                                type='radio'
                                id='haircolor_ALL'
                                name='haircolor'
                                defaultChecked
                                onChange={() => this.handleHaircolorFilter_ALL()}
                            />
                            <label htmlFor='haircolor_ALL' className='global-category'>
                                All
                            </label>
                        </div>

                        {this.state.loaded.haircolors &&
                            Object.keys(this.state.haircolors).map((i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='radio'
                                        name='haircolor'
                                        id={`haircolor-${this.state.haircolors[i]}`}
                                        onChange={() => this.handleHaircolorFilter(this.state.haircolors[i])}
                                    />
                                    <label htmlFor={`haircolor-${this.state.haircolors[i]}`}>
                                        {this.state.haircolors[i]}
                                        <LabelCount
                                            prop='haircolor'
                                            label={this.state.haircolors[i]}
                                            obj={this.state.stars}
                                            isArr={true}
                                            isHidden={this.isHidden}
                                        />
                                    </label>
                                </div>
                            ))}
                    </div>

                    <h2>Ethnicity</h2>
                    <div id='ethnicities'>
                        <div className='input-wrapper'>
                            <input
                                type='radio'
                                id='ethnicity_ALL'
                                name='ethnicity'
                                defaultChecked
                                onChange={() => this.handleEthnicityFilter_ALL()}
                            />
                            <label htmlFor='ethnicity_ALL' className='global-category'>
                                All
                            </label>
                        </div>

                        {this.state.loaded.ethnicities &&
                            Object.keys(this.state.ethnicities).map((i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='radio'
                                        name='ethnicity'
                                        id={`ethnicity-${this.state.ethnicities[i]}`}
                                        onChange={() => this.handleEthnicityFilter(this.state.ethnicities[i])}
                                    />
                                    <label htmlFor={`ethnicity-${this.state.ethnicities[i]}`}>
                                        {this.state.ethnicities[i]}
                                        <LabelCount
                                            prop='ethnicity'
                                            label={this.state.ethnicities[i]}
                                            obj={this.state.stars}
                                            isArr={true}
                                            isHidden={this.isHidden}
                                        />
                                    </label>
                                </div>
                            ))}
                    </div>

                    <h2 className='h5'>Country</h2>
                    <div id='countries' className='input-wrapper'>
                        {this.state.loaded.countries && (
                            <select className='form-control' onChange={this.handleCountryFilter.bind(this)}>
                                <option className='global-category'>ALL</option>
                                {this.state.countries.map((item, i) => (
                                    <option key={i}>{item.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                </aside>

                <section id='stars' className='col-10'>
                    {this.state.loaded.stars && (
                        <h2 className='text-center'>
                            <span className='count'>{this.getCount()}</span> Stars
                        </h2>
                    )}

                    <div className='row justify-content-center'>
                        {this.state.loaded.stars && this.state.stars[0].id !== 0 ? (
                            this.state.stars.map((item, i) => (
                                <a
                                    key={i}
                                    href={`/star/${this.state.stars[i].id}`}
                                    className={`star ribbon-container card ${this.isHidden(item) ? 'd-none' : ''}`}
                                >
                                    <img className='card-img-top' src={`${config.source}/images/stars/${item.image}`} alt='star' />

                                    <span className='title card-title text-center'>{item.name}</span>

                                    <span className='ribbon'>
                                        <DaysToYears>{item.age}</DaysToYears>
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

        document.title = 'Star Search'
    }

    getData() {
        const { loaded } = this.state

        if (!loaded.stars) {
            Axios.get(`${config.api}/starsearch.php`).then(({ data: { stars } }) => {
                this.setState((prevState) => {
                    stars = stars.map((item) => {
                        item.hidden = {
                            titleSearch: false,

                            breast: false,
                            haircolor: false,
                            ethnicity: false,
                            country: false,

                            noBreast: false,
                        }

                        return item
                    })

                    const { loaded } = prevState
                    loaded.stars = true

                    return { stars, loaded }
                })
            })
        }

        if (!loaded.breasts || !loaded.haircolors || !loaded.ethnicities || !loaded.countries) {
            Axios.get(`${config.api}/stardata.php`).then(({ data }) => {
                this.setState((prevState) => {
                    const { breast: breasts, haircolor: haircolors, ethnicity: ethnicities, country: countries } = data

                    const { loaded } = prevState
                    loaded.breasts = true
                    loaded.haircolors = true
                    loaded.ethnicities = true
                    loaded.countries = true

                    return { breasts, haircolors, ethnicities, countries, loaded }
                })
            })
        }
    }
}

export default StarSearchPage
