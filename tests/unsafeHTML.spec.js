import Alpine from 'alpinejs'
import AlpineUnsafeHTMLDirective from '../dist/unsafeHTML'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
    window.alert = jest.fn()
})

beforeEach(() => {
    AlpineUnsafeHTMLDirective.start()
})

test('x-unsafe-html > on init', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: '<h1>bar</h1><script>alert(1)</script>' }">
            <span x-unsafe-html="foo"></span>
        </div>
    `

    expect(window.alert).toHaveBeenCalledTimes(0)

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('span').innerHTML).toEqual('<h1>bar</h1><script>alert(1)</script>')
        expect(window.alert).toHaveBeenCalledTimes(1)
    })
})
