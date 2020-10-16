import React, { Component } from 'react'

import { CSSTransition } from 'react-transition-group'

import './overlay.scss'

const duration = { start: 300, delay: 400, stop: 300 }

function getCount(obj) {
    const val = Object.values(obj).reduce((a, b) => {
        return a + b
    }, 0)

    return val
}

export function handleOverlay(data = null) {
    this.setState((prevState) => {
        const { overlay } = prevState

        overlay.data = data
        overlay.visible = !overlay.visible

        return { overlay }
    })

    if (data !== null) {
        setTimeout(() => {
            this.handleOverlay()
        }, getCount(duration))
    }
}

class Overlay extends Component {
    isVisible() {
        return this.props.visible
    }

    render() {
        return (
            <React.Fragment>
                {this.isVisible() && (
                    <CSSTransition appear={true} in={true} timeout={duration['delay']} classNames='overlay'>
                        <div className='overlay mx-auto'>
                            <img src={`../img/${this.props.children}`} alt='overlay' />
                        </div>
                    </CSSTransition>
                )}
            </React.Fragment>
        )
    }
}

export default Overlay
