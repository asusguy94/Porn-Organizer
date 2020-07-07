import React, { Component } from 'react'

export class DaysToYears extends Component {
    render() {
        return Math.floor(this.props.children / 365)
    }
}

export default class RenderDate extends Component {
    render() {
        const date = new Date(`${this.props.children}`)

        return (
            <React.Fragment>
                {date.getDate()} {this.getFullMonth(date.getMonth())}{' '}
                {date.getFullYear()}
            </React.Fragment>
        )
    }

    getFullMonth(month) {
        const arr = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'Nove mber',
            'December',
        ]

        return arr[month]
    }
}
