import React, { Component } from 'react'

import Axios from 'axios'

import './editor.scss'

import config from '../config.json'

export default class EditorPage extends Component {
    render() {
        return (
            <div id='editor-page' className='col-12 row'>
                <AttributesPage className='col-3' />
                <CategoriesPage className='col-3' />
                <LocationsPage className='col-3' />
                <CountriesPage className='col-3' />
            </div>
        )
    }
}

class AttributesPage extends Component {
    state = {
        input: '',
    }

    handleChange(e) {
        this.setState({ input: e.target.value })
    }

    handleSubmit() {
        const { input } = this.state

        if (input.length) {
            // lower case is not allowed -- make red border and display notice
            if (input.toLowerCase() === input) return false

            Axios.get(`${config.api}/attributes.php?type=add&name=${input}`).then(() => {
                window.location.reload()

                // TODO use stateObj instead
            })
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            this.handleSubmit()
        }
    }

    render() {
        return (
            <div className={this.props.className}>
                <header className='row'>
                    <h2 className='col-4'>Attributes</h2>

                    <div className='col-8 mt-1'>
                        <input
                            type='text'
                            className='col-8 px-1'
                            ref={(input) => (this.input = input)}
                            onChange={this.handleChange.bind(this)}
                            onKeyPress={this.handleKeyPress.bind(this)}
                        />
                        <div className='btn btn-sm btn-primary float-right' onClick={this.handleSubmit.bind(this)}>
                            Add Attribute
                        </div>
                    </div>
                </header>

                <Attributes />
            </div>
        )
    }
}

class Attributes extends Component {
    state = {
        attributes: [],
    }

    componentDidMount() {
        this.getData()
    }

    updateAttribute(ref, value) {
        Axios.get(`${config.api}/editattribute.php?attributeID=${ref.id}&value=${value}`).then(({ data }) => {
            if (data.success) {
                this.setState(
                    this.state.attributes.filter((attribute) => {
                        if (ref.id === attribute.id) {
                            attribute.name = value
                        }

                        return attribute
                    })
                )
            }
        })
    }

    render() {
        return (
            <table className='table table-striped'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Attribute</th>
                    </tr>
                </thead>

                <tbody>
                    {this.state.attributes.map((attribute, i) => (
                        <Attribute key={i} data={attribute} updateAttribute={(ref, value) => this.updateAttribute(ref, value)} />
                    ))}
                </tbody>
            </table>
        )
    }

    getData() {
        Axios.get(`${config.api}/attributes.php`).then(({ data: attributes }) => {
            attributes.sort((a, b) => a.id - b.id)
            this.setState({ attributes })
        })
    }
}

class Attribute extends Component {
    constructor() {
        super()
        this.state = { edit: false, value: null }
    }

    saveAttribute() {
        this.setState({ edit: false })

        if (this.state.value) {
            this.props.updateAttribute(this.props.data, this.state.value)
        }
    }

    render() {
        const { id, name } = this.props.data

        return (
            <tr>
                <th>{id}</th>
                <td
                    className='btn-link'
                    onClick={() => {
                        this.setState({ edit: true })
                    }}
                >
                    {this.state.edit ? (
                        <input
                            type='text'
                            defaultValue={name}
                            ref={(input) => input && input.focus()}
                            onBlur={this.saveAttribute.bind(this)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    this.saveAttribute()
                                }
                            }}
                            onChange={(e) => {
                                this.setState({ value: e.target.value })
                            }}
                        />
                    ) : (
                        <span>{name}</span>
                    )}
                </td>
            </tr>
        )
    }
}

class CategoriesPage extends Component {
    state = {
        input: '',
    }

    handleChange(e) {
        this.setState({ input: e.target.value })
    }

    handleSubmit() {
        const { input } = this.state

        if (input.length) {
            // lower case is not allowed -- make red border and display notice
            if (input.toLowerCase() === input) return false

            Axios.get(`${config.api}/categories.php?type=add&name=${input}`).then(({ data }) => {
                if (data.success) {
                    window.location.reload()
                }

                // TODO use stateObj instead
            })
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            this.handleSubmit()
        }
    }

    render() {
        return (
            <div className={this.props.className}>
                <header className='row'>
                    <h2 className='col-4'>Categories</h2>

                    <div className='col-8 mt-1'>
                        <input
                            type='text'
                            className='col-8 px-1'
                            ref={(input) => (this.input = input)}
                            onChange={this.handleChange.bind(this)}
                            onKeyPress={this.handleKeyPress.bind(this)}
                        />
                        <div className='btn btn-sm btn-primary float-right' onClick={this.handleSubmit.bind(this)}>
                            Add Category
                        </div>
                    </div>
                </header>

                <Categories />
            </div>
        )
    }
}

class Categories extends Component {
    state = {
        categories: [],
    }

    componentDidMount() {
        this.getData()
    }

    updateCategory(ref, value) {
        Axios.get(`${config.api}/editcategory.php?categoryID=${ref.id}&value=${value}`).then(({ data }) => {
            if (data.success) {
                this.setState(
                    this.state.categories.filter((category) => {
                        if (ref.id === category.id) {
                            category.name = value
                        }

                        return category
                    })
                )
            }
        })
    }

    render() {
        return (
            <table className='table table-striped'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Category</th>
                    </tr>
                </thead>

                <tbody>
                    {this.state.categories.map((category, i) => (
                        <Category key={i} data={category} updateCategory={(ref, value) => this.updateCategory(ref, value)} />
                    ))}
                </tbody>
            </table>
        )
    }

    getData() {
        Axios.get(`${config.api}/categories.php`).then(({ data: categories }) => {
            categories.sort((a, b) => a.id - b.id)
            this.setState({ categories })
        })
    }
}

class Category extends Component {
    constructor() {
        super()
        this.state = { edit: false, value: null }
    }

    saveCategory() {
        this.setState({ edit: false })

        if (this.state.value) {
            this.props.updateCategory(this.props.data, this.state.value)
        }
    }

    render() {
        const { id, name } = this.props.data

        return (
            <tr>
                <th>{id}</th>
                <td
                    className='btn-link'
                    onClick={() => {
                        this.setState({ edit: true })
                    }}
                >
                    {this.state.edit ? (
                        <input
                            type='text'
                            defaultValue={name}
                            ref={(input) => input && input.focus()}
                            onBlur={this.saveCategory.bind(this)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    this.saveCategory()
                                }
                            }}
                            onChange={(e) => {
                                this.setState({ value: e.target.value })
                            }}
                        />
                    ) : (
                        <span>{name}</span>
                    )}
                </td>
            </tr>
        )
    }
}

class LocationsPage extends Component {
    state = {
        input: '',
    }

    handleChange(e) {
        this.setState({ input: e.target.value })
    }

    handleSubmit() {
        const { input } = this.state

        if (input.length) {
            // lower case is not allowed -- make red border and display notice
            if (input.toLowerCase() === input) return false

            Axios.get(`${config.api}/locations.php?type=add&name=${input}`).then(({ data }) => {
                if (data.success) {
                    window.location.reload()
                }

                // TODO use stateObj instead
            })
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            this.handleSubmit()
        }
    }

    render() {
        return (
            <div className={this.props.className}>
                <header className='row'>
                    <h2 className='col-4'>Locations</h2>

                    <div className='col-8 mt-1'>
                        <input
                            type='text'
                            className='col-8 px-1'
                            ref={(input) => (this.input = input)}
                            onChange={this.handleChange.bind(this)}
                            onKeyPress={this.handleKeyPress.bind(this)}
                        />
                        <div className='btn btn-sm btn-primary float-right' onClick={this.handleSubmit.bind(this)}>
                            Add Location
                        </div>
                    </div>
                </header>

                <Locations />
            </div>
        )
    }
}

class Locations extends Component {
    state = {
        locations: [],
    }

    componentDidMount() {
        this.getData()
    }

    updateLocation(ref, value) {
        Axios.get(`${config.api}/editlocation.php?locationID=${ref.id}&value=${value}`).then(({ data }) => {
            if (data.success) {
                this.setState(
                    this.state.locations.filter((location) => {
                        if (ref.id === location.id) {
                            location.name = value
                        }

                        return location
                    })
                )
            }
        })
    }

    render() {
        return (
            <table className='table table-striped'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Location</th>
                    </tr>
                </thead>

                <tbody>
                    {this.state.locations.map((location, i) => (
                        <Location key={i} data={location} updateLocation={(ref, value) => this.updateLocation(ref, value)} />
                    ))}
                </tbody>
            </table>
        )
    }

    getData() {
        Axios.get(`${config.api}/locations.php`).then(({ data: locations }) => {
            locations.sort((a, b) => a.id - b.id)
            this.setState({ locations })
        })
    }
}

class Location extends Component {
    constructor() {
        super()
        this.state = { edit: false, value: null }
    }

    saveLocation() {
        this.setState({ edit: false })

        if (this.state.value) {
            this.props.updateLocation(this.props.data, this.state.value)
        }
    }

    render() {
        const { id, name } = this.props.data

        return (
            <tr>
                <th>{id}</th>
                <td
                    className='btn-link'
                    onClick={() => {
                        this.setState({ edit: true })
                    }}
                >
                    {this.state.edit ? (
                        <input
                            type='text'
                            defaultValue={name}
                            ref={(input) => input && input.focus()}
                            onBlur={this.saveLocation.bind(this)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    this.saveLocation()
                                }
                            }}
                            onChange={(e) => {
                                this.setState({ value: e.target.value })
                            }}
                        />
                    ) : (
                        <span>{name}</span>
                    )}
                </td>
            </tr>
        )
    }
}

class CountriesPage extends Component {
    state = {
        input: '',
    }

    handleChange(e) {
        this.setState({ input: e.target.value })
    }

    handleSubmit() {
        const { input } = this.state

        if (input.length) {
            // lower case is not allowed -- make red border and display notice
            if (input.toLowerCase() === input) return false

            Axios.get(`${config.api}/countries.php?type=add&name=${input}`).then(({ data }) => {
                if (data.success) {
                    window.location.reload()
                }

                // TODO use stateObj instead
            })
        }
    }

    handleKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            this.handleSubmit()
        }
    }

    render() {
        return (
            <div className={this.props.className}>
                <header className='row'>
                    <h2 className='col-4'>Countries</h2>

                    <div className='col-8 mt-1'>
                        <input
                            type='text'
                            className='col-8 px-1'
                            ref={(input) => (this.input = input)}
                            onChange={this.handleChange.bind(this)}
                            onKeyPress={this.handleKeyPress.bind(this)}
                        />
                        <div className='btn btn-sm btn-primary float-right' onClick={this.handleSubmit.bind(this)}>
                            Add Country
                        </div>
                    </div>
                </header>

                <Countries />
            </div>
        )
    }
}

class Countries extends Component {
    state = {
        countries: [],
    }

    componentDidMount() {
        this.getData()
    }

    updateCountry(ref, value, label) {
        Axios.get(`${config.api}/editcountry.php?countryID=${ref.id}&label=${label}&value=${value}`).then(({ data }) => {
            if (data.success) {
                this.setState(
                    this.state.countries.filter((country) => {
                        if (ref.id === country.id) {
                            country.name = data.name
                            country.code = data.code
                        }

                        return country
                    })
                )
            }
        })
    }

    render() {
        return (
            <table className='table table-striped'>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Country</th>
                        <th>Code</th>
                        <th>Flag</th>
                    </tr>
                </thead>

                <tbody>
                    {this.state.countries.map((country, i) => (
                        <Country
                            key={i}
                            data={country}
                            updateCountry={(ref, value, label = 'country') => this.updateCountry(ref, value, label)}
                            updateCode={(ref, value, label = 'code') => this.updateCountry(ref, value, label)}
                        />
                    ))}
                </tbody>
            </table>
        )
    }

    getData() {
        Axios.get(`${config.api}/countries.php`).then(({ data: countries }) => {
            countries.sort((a, b) => a.id - b.id)
            this.setState({ countries })
        })
    }
}

class Country extends Component {
    constructor() {
        super()
        this.state = {
            country: {
                edit: false,
                value: null,
            },
            code: {
                edit: false,
                value: null,
            },
        }
    }

    saveCountry() {
        this.setState((prevState) => {
            const { country } = prevState
            country.edit = false

            return { country }
        })

        if (this.state.country.value) {
            this.props.updateCountry(this.props.data, this.state.country.value)
        }
    }

    saveCode() {
        this.setState((prevState) => {
            const { code } = prevState
            code.edit = false

            return { code }
        })

        if (this.state.code.value) {
            this.props.updateCode(this.props.data, this.state.code.value)
        }
    }

    render() {
        const { id, name, code } = this.props.data

        return (
            <tr>
                <th>{id}</th>
                <td
                    className='btn-link'
                    onClick={() => {
                        this.setState((prevState) => {
                            const { country } = prevState
                            country.edit = true

                            return { country }
                        })
                    }}
                >
                    {this.state.country.edit ? (
                        <input
                            type='text'
                            defaultValue={name}
                            ref={(input) => input && input.focus()}
                            onBlur={this.saveCountry.bind(this)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    this.saveCountry()
                                }
                            }}
                            onChange={(e) => {
                                let value = e.target.value
                                this.setState((prevState) => {
                                    const { country } = prevState
                                    country.value = value

                                    return { country }
                                })
                            }}
                        />
                    ) : (
                        <span>{name}</span>
                    )}
                </td>
                <td
                    className='btn-link'
                    onClick={() => {
                        this.setState((prevState) => {
                            const { code } = prevState
                            code.edit = true

                            return { code }
                        })
                    }}
                >
                    {this.state.code.edit ? (
                        <input
                            type='text'
                            defaultValue={code}
                            ref={(input) => input && input.focus()}
                            onBlur={this.saveCode.bind(this)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    this.saveCode()
                                }
                            }}
                            onChange={(e) => {
                                let value = e.target.value
                                this.setState((prevState) => {
                                    const { code } = prevState
                                    code.value = value

                                    return { code }
                                })
                            }}
                            maxLength={2}
                        />
                    ) : (
                        <span>{code}</span>
                    )}
                </td>

                <td>
                    <i className={`flag flag-${code}`} />
                </td>
            </tr>
        )
    }
}
