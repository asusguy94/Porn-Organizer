import { screen } from '@testing-library/react'

import { renderWithRouter } from '@/test-utils'

import Videos from './videos'

test('videos-page has at least 1 video-link', async () => {
	renderWithRouter(<Videos />, { route: '/video' })
	const items = await screen.findAllByRole('button')
	expect(items).not.toHaveLength(0)
})
