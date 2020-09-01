import React, { Component } from 'react'

import './modal.scss'

export function handleModal(title = null, data = null) {
    if (title !== null && data !== null && this.state.modal.visible) this.handleModal()

    this.setState((prevState) => {
        let modal = prevState.modal
        modal.title = title
        modal.data = data
        modal.visible = !modal.visible

        return { modal }
    })
}

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
        const { props } = this

        return (
            <React.Fragment>
                {props.visible && (
                    <div id='modal' className='card'>
                        <div className='card-header'>
                            <h3>{props.title}</h3>
                        </div>

                        <div className='card-body'>
                            <div className='content'>{props.children}</div>
                            <div className='actions'>
                                <div className='btn btn-sm btn-secondary' onClick={props.onClose}>
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
