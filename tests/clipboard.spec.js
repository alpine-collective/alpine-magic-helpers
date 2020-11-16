import AlpineClipboard from '../dist/alpine-clipboard'
import Alpine from 'alpinejs'
import { waitFor } from '@testing-library/dom'

beforeEach(() => {
    window.Alpine = Alpine
})

test('contents can be copied to clipboard', async () => {
    document.execCommand = jest.fn()

    document.body.innerHTML = `
        <div x-data="{ input: '' }">
            <button x-on:click.prevent="$clipboard(input)"></button>
        </div>
    `

    AlpineClipboard.start()

    await Alpine.start()

    document.querySelector('button').click()

    await waitFor(() => {
        expect(document.execCommand).toHaveBeenCalledWith('copy')
    })
})
