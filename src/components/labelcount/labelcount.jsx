import React, { Component } from 'react'

class LabelCount extends Component {
    constructor(props) {
        super(props)

        this.isArr = props.isArr || false
        this.isHidden = props.isHidden

        this.label = props.label
        this.prop = props.prop
    }

    getPropCount(prop, label, visibleOnly = false) {
        const arr = this.props.obj.filter((item) => {
            return item[prop].includes(label) && !(this.isHidden(item) && visibleOnly)
        })

        return arr.length
    }

    getArrCount(prop, label, visibleOnly = false) {
        const arr = this.props.obj.filter((item) => {
            return item[prop].includes(label) && !(this.isHidden(item) && visibleOnly)
        })

        return arr.length
    }

    render() {
        return (
            <React.Fragment>
                ({this.isArr ? this.getArrCount(this.prop, this.label, true) : this.getPropCount(this.prop, this.label, true)}
                <span className='divider'>|</span>
                {this.isArr ? this.getArrCount(this.prop, this.label) : this.getPropCount(this.prop, this.label)})
            </React.Fragment>
        )
    }
}

export default LabelCount
