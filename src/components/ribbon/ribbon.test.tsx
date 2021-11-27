import { render } from '@testing-library/react'
import Ribbon from './ribbon'

test('ribbon without label or props', () => {
	const { container: ribbon } = render(<Ribbon />)
	expect(ribbon.firstChild).toBeNull()
})

test('ribbon first', () => {
	const { container: ribbon } = render(<Ribbon isFirst={true} />)

	expect(ribbon.firstChild).toHaveClass('ribbon')
	expect(ribbon.firstChild).toHaveTextContent('First')
})

test('ribbon last', () => {
	const { container: ribbon } = render(<Ribbon isLast={true} />)
	expect(ribbon.firstChild).toHaveTextContent('Latest')
})

test('ribbon label="TestLabel"', () => {
	const { container: ribbon } = render(<Ribbon label='TestLabel' />)
	expect(ribbon.firstChild).toHaveTextContent('TestLabel')
})

test('ribbon align="left"', () => {
	const { container: ribbon } = render(<Ribbon label='TestLabel' align='left' />)
	expect(ribbon.firstChild).toHaveClass('ribbon-left', 'ribbon-purple')
})
