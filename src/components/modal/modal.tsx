import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

import { Card, CardContent, Button, Typography, Box } from '@material-ui/core'

//@ts-ignore
import KeyboardEventHandler from 'react-keyboard-event-handler'

import './modal.scss'

import { settings as settingsConfig } from '@/config'

//TODO improve children, props.children, pros.filter, children=children.filter

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

				if (query.length && settingsConfig.modal.filter.startsWithOnTop) {
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
				<Card id='modal'>
					<Box id='modal__header'>
						<Typography variant='h5' className='label'>
							{props.title}
						</Typography>
						{query ? <Typography className='query'>{query}</Typography> : null}
					</Box>

					<CardContent id='modal__body'>
						<Box className='content'>{children}</Box>
						<Box className='actions'>
							<Button size='small' variant='contained' color='secondary' onClick={props.onClose}>
								Close
							</Button>
						</Box>
					</CardContent>
				</Card>
			) : null}

			<KeyboardEventHandler
				handleKeys={
					props.filter && settingsConfig.modal.filter.search
						? ['alphabetic', 'space', 'backspace', 'esc']
						: ['esc']
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
