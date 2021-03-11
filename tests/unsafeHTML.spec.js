import Alpine from 'alpinejs'
import AlpineUnsafeHTMLCustomDirective from '../dist/unsafeHTML'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
    window.alert = jest.fn()
})

beforeEach(() => {
    AlpineUnsafeHTMLCustomDirective.start()
})

test('x-unsafe-html > on init', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: '<h1>bar</h1><script>alert(1)</script>' }">
            <div id="component" x-unsafe-html="foo"></div>
        </div>
    `

    expect(window.alert).toHaveBeenCalledTimes(0)

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('#component').innerHTML).toEqual('<h1>bar</h1><script>alert(1)</script>')
        expect(window.alert).toHaveBeenCalledTimes(1)
    })
})
