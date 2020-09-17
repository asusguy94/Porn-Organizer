import React, { Component } from 'react'

import KeyboardEventHandler from 'react-keyboard-event-handler'

import config from '../config'

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

        let children = props.children
        if (props.filter) {
            children = children
                .filter((item) => {
                    if (item.props.children.toLowerCase().includes(state.query)) return item
                    else return null
                })
                .sort((a, b) => {
                    const { query } = state

                    let valA = a.props.children.toLowerCase()
                    let valB = b.props.children.toLowerCase()

                    if (query.length && config.modal.filter.startsWithOnTop) {
                        if (valA.startsWith(query) && valB.startsWith(query)) return 0
                        else if (valA.startsWith(query)) return -1
                        else if (valB.startsWith(query)) return 1
                    }

                    return valA.localeCompare(valB)
                })
        }

        return (
            <React.Fragment>
                {props.visible && (
                    <div id='modal' className='card'>
                        <div className='card-header text-center'>
                            <h3>{props.title}</h3>
                            {state.query && <h4 className='query bg-warning'>{state.query}</h4>}
                        </div>

                        <div className='card-body'>
                            <div className='content'>{children}</div>
                            <div className='actions'>
                                <div className='btn btn-sm btn-secondary' onClick={props.onClose}>
                                    Close
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <KeyboardEventHandler
                    handleKeys={props.filter && config.modal.filter.search ? ['alphabetic', 'space', 'backspace', 'esc'] : ['esc']}
                    onKeyEvent={(key, e) => this.handleKeyPress(key, e)}
                    handleFocusableElements={true}
                    isDisabled={!props.visible}
                />
            </React.Fragment>
        )
    }
}

export default Modal
