import Alpine from 'alpinejs'
import AlpineUndoMagicMethod from '../dist/undo'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(() => {
    AlpineUndoMagicMethod.start()
})

test('$track > component can track updates', async () => {
    document.body.innerHTML = `
        <div x-data="{ number: 0 }" x-init="$track()">
            <button
                @click="number = number + 1"
                x-text="number"></button>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('div').changes).toEqual([])
    })

    document.querySelectorAll('button')[0].click()

    await waitFor(() => {
        expect(document.querySelector('div').changes.length).toEqual(1)
    })

    document.querySelectorAll('button')[0].click()

    await waitFor(() => {
        expect(document.querySelector('div').changes.length).toEqual(2)
    })
})

test('$track > component can render x-show when changes are available', async () => {
    document.body.innerHTML = `
        <div x-data="{ number: 0 }" x-init="$track()">
            <button
                @click="number = number + 1"
                x-text="number"></button>
            <p x-show="$el.changes.length > 0">undo</p>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('div').changes).toEqual([])
    })

    document.querySelectorAll('button')[0].click()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('undo')
    })
})
