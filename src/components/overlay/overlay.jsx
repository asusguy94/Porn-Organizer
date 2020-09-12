import React, { Component } from 'react'

import { CSSTransition } from 'react-transition-group'

import './overlay.scss'

const duration = []
duration['start'] = 300
duration['delay'] = 400
duration['stop'] = 300

function getCount(obj) {
    const val = Object.values(obj).reduce((a, b) => {
        return a + b
    }, 0)

    return val
}

// TODO overlay methods for long-operations
/*window.timer = null
export function handleOverlay_start(data) {
    this.setState((prevState) => {
        const { overlay } = prevState

        overlay.data = data
        overlay.visible = true

        return { overlay }
    })

    window.timer = setTimeout(() => {
        this.handleOverlay_stop()
    }, 5000) // TIME_LIMIT
}

export function handleOverlay_stop() {
    clearTimeout(window.timer)

    this.setState((prevState) => {
        const { overlay } = prevState

        overlay.data = null
        overlay.visible = false

        return { overlay }
    })
}*/

export function handleOverlay(data = null) {
    this.setState((prevState) => {
        const { overlay } = prevState

        overlay.data = data
        overlay.visible = !overlay.visible

        return { overlay }
    })

    // TODO this only works for quick-actions, actions that takes little time
    // TODO evaluate if a slow action is needed, action that takes some time
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
