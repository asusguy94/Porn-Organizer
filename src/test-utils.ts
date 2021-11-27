import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

export const renderWithRouter = (ui: any, { route = '/' } = {}) => {
	window.history.pushState({}, 'Test page', route)

	return render(ui, { wrapper: BrowserRouter })
}

export const renderWithRouterAsync = async (ui: any, { route = '/' }) => {
	return new Promise((resolve) => {
		resolve(renderWithRouter(ui, { route }))
	})
}
