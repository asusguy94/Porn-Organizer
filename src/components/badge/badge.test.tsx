import { render } from '@testing-library/react'
import Badge from './badge'

test('content=9 && content="9"', () => {
	const { container: badge } = render(<Badge content={9}>ChildNode</Badge>)
	const { container: badge2 } = render(<Badge content={9}>ChildNode</Badge>)

	// Test Number
	expect(badge.firstChild).toHaveClass('badge-x')
	expect(badge2.firstElementChild?.classList).toHaveLength(1)

	// Test String
	expect(badge2.firstChild).toHaveClass('badge-x')
	expect(badge2.firstElementChild?.classList).toHaveLength(1)
})

test('content=99 && content="99"', () => {
	const { container: badge } = render(<Badge content={99}>ChildNode</Badge>)
	const { container: badge2 } = render(<Badge content='99'>ChildNode</Badge>)

	// Test Number
	expect(badge.firstChild).toHaveClass('badge-xx')
	expect(badge2.firstElementChild?.classList).toHaveLength(1)

	// Test String
	expect(badge2.firstChild).toHaveClass('badge-xx')
	expect(badge2.firstElementChild?.classList).toHaveLength(1)
})
