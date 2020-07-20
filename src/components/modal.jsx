import React, { Component } from 'react'

import './styles/modal.scss'

class Modal extends Component {
    constructor(props) {
        super(props)
        this.escFunc = this.escFunc.bind(this)
    }

    escFunc(e) {
        if (this.props.visible) {
            if (e.keyCode === 27) this.props.onClose()
        }
    }

    render() {
        return (
            <React.Fragment>
                {this.props.visible && (
                    <div id='modal' className='card'>
                        <div className='card-body'>
                            <h2 className='card-title'>{this.props.title}</h2>
                            <div className='content'>{this.props.children}</div>
                            <div className='actions'>
                                <div className='btn btn-sm btn-danger' onClick={this.props.onClose}>
                                    Close
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </React.Fragment>
        )
    }

    componentDidMount() {
        document.addEventListener('keydown', this.escFunc, false)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.escFunc, false)
    }
}

export default Modal
