import { render } from '@testing-library/react'
import Spinner from './spinner'

test('ribbon without label or props', () => {
	const { container: spinner } = render(<Spinner />)
	expect(spinner.firstChild).toHaveAttribute('id', 'loader')
	expect(spinner.firstChild).toBeEmptyDOMElement()
})
