import React, { Component } from 'react'

import KeyboardEventHandler from 'react-keyboard-event-handler'

import './modal.scss'

export function handleModal(title = null, data = null, filter = false) {
    if (title !== null && data !== null && this.state.modal.visible) this.handleModal()

    this.setState((prevState) => {
        const { modal } = prevState
        modal.title = title
        modal.data = data
        modal.visible = !modal.visible
        modal.filter = filter

        return { modal }
    })
}

class Modal extends Component {
    state = {
        query: '',
    }

    handleKeyPress(key, e) {
        e.preventDefault()

        switch (key) {
            case 'esc':
                this.resetData()
                this.props.onClose()
                break
            case 'backspace':
                this.setState((prevState) => {
                    let { query } = prevState
                    query = query.slice(0, -1)

                    return { query }
                })
                break
            default:
                this.setState((prevState) => {
                    let { query } = prevState
                    query += key

                    return { query }
                })
        }
    }

    resetData() {
        this.setState({ query: '' })
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.filter !== prevProps.filter) {
            this.resetData()
        }
    }

    render() {
        const { props, state } = this

        return (
            <React.Fragment>
                {props.visible && (
                    <div id='modal' className='card'>
                        <div className='card-header text-center'>
                            <h3>{props.title}</h3>
                            {this.state.query && <h4 className='query bg-warning'>{this.state.query}</h4>}
                        </div>

                        <div className='card-body'>
                            <div className='content'>
                                {props.filter
                                    ? props.children.map((item, i) => item.props.children.toLowerCase().includes(state.query) && item)
                                    : props.children}
                            </div>
                            <div className='actions'>
                                <div className='btn btn-sm btn-secondary' onClick={props.onClose}>
                                    Close
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <KeyboardEventHandler
                    handleKeys={props.filter ? ['alphabetic', 'space', 'backspace', 'esc'] : ['esc']}
                    onKeyEvent={(key, e) => this.handleKeyPress(key, e)}
                    handleFocusableElements={true}
                    isDisabled={!props.visible}
                />
            </React.Fragment>
        )
    }
}

export default Modal
