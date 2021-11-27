import { screen } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react-hooks'

import { renderWithRouter, renderWithRouterAsync } from '@/test-utils'

import Home, { HomeColumn } from './home'

test('home-page', async () => {
	renderWithRouter(<Home />)

	const recent = await screen.findByRole('heading', { name: /recent/i })
	const newest = await screen.findByRole('heading', { name: /newest/i })
	const popular = await screen.findByRole('heading', { name: /popular/i })

	expect(recent).toHaveTextContent('Recent (12)')
	expect(newest).toHaveTextContent('Newest (12)')
	expect(popular).toHaveTextContent('Popular (24)')
})

test('recent', async () => {
	renderWithRouter(<HomeColumn label='recent' />)

	const recent = await screen.findByRole('heading', { name: /recent/i })
	expect(recent).toHaveTextContent('Recent (12)')
})

test('recent disabled', async () => {
	renderWithRouter(<HomeColumn label='true' enabled={false} />)

	//const t = await screen.findByRole('heading', { name: /recent/i })

	//expect(t).not.toThrowError()
})

test('recent 24', async () => {
	renderWithRouter(<HomeColumn label='recent' limit={24} />)

	const recent = await screen.findByRole('heading', { name: /recent/i })
	expect(recent).toHaveTextContent('Recent (24)')
})
