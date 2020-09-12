import React, { Component } from 'react'

import KeyboardEventHandler from 'react-keyboard-event-handler'

import './modal.scss'

export function handleModal(title = null, data = null) {
    if (title !== null && data !== null && this.state.modal.visible) this.handleModal()

    this.setState((prevState) => {
        const { modal } = prevState
        modal.title = title
        modal.data = data
        modal.visible = !modal.visible

        return { modal }
    })
}

class Modal extends Component {
    handleKeyPress(key, e) {
        e.preventDefault()

        this.props.onClose()
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

                <KeyboardEventHandler
                    handleKeys={['esc']}
                    onKeyEvent={(key, e) => this.handleKeyPress(key, e)}
                    handleFocusableElements={true}
                    isDisabled={!props.visible}
                />
            </React.Fragment>
        )
    }
}

export default Modal
