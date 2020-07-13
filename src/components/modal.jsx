import React, { Component } from 'react'

import './styles/modal.scss'

// TODO ESC-key press
class Modal extends Component {
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
}

export default Modal
