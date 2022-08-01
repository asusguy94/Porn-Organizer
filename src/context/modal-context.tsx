import React from 'react'

const ModalContext = React.createContext({
	method: (...args: any) => {},
	data: { visible: false, title: null, data: null, filter: false }
})

interface ContextProvider {
	onModal: (...args: any) => void
	children: React.ReactNode
}
export const ModalContextProvider = ({ onModal, children }: ContextProvider) => {
	return (
		<ModalContext.Provider
			value={{ method: onModal, data: { visible: false, title: null, data: null, filter: false } }}
		>
			{children}
		</ModalContext.Provider>
	)
}

export default ModalContext
