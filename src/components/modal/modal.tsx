import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

//@ts-ignore
import KeyboardEventHandler from 'react-keyboard-event-handler'

import config from '../config.json'

import './modal.scss'

//TODO improve children, props.children, pros.filter, children=chilren.filter

const Modal = (props: any) => {
	const [query, setQuery] = useState('')

	const handleKeyPress = (key: any, e: any) => {
		e.preventDefault()

		switch (key) {
			case 'esc':
				setQuery('')
				props.onClose()
				break
			case 'backspace':
				setQuery(query.slice(0, -1))
				break
			default:
				setQuery(query + key)
		}
	}

	useEffect(() => setQuery(''), [props.filter])

	let children = props.children
	if (props.filter) {
		children = children
			.filter((item: any) => item.props.children.toLowerCase().includes(query))
			.sort((a: any, b: any) => {
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
	return ReactDOM.createPortal(
		<>
			{props.visible ? (
				<div id='modal' className='card'>
					<div className='card-header text-center'>
						<h3>{props.title}</h3>
						{query ? <h4 className='query bg-warning'>{query}</h4> : null}
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
			) : null}

			<KeyboardEventHandler
				handleKeys={
					props.filter && config.modal.filter.search ? ['alphabetic', 'space', 'backspace', 'esc'] : ['esc']
				}
				onKeyEvent={(key: any, e: any) => handleKeyPress(key, e)}
				handleFocusableElements={true}
				isDisabled={!props.visible}
			/>
		</>,
		//@ts-ignore
		document.getElementById('portal')
	)
}

export default Modal
