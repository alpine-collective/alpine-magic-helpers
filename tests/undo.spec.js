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
            <p x-text="$el.changes.length ? 'undo' : ''"></p>
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

test('$undo > component can render x-show when changes are removed', async () => {
    document.body.innerHTML = `
        <div x-data="{ number: 0 }" x-init="$track()">
            <button
                id="increment"
                @click="number = number + 1"
                x-text="number"></button>
            <button
                id="undo"
                @click="$undo()"></button>
            <p x-text="$el.changes.length ? 'undo' : 'undo-removed'"></p>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('div').changes).toEqual([])
    })

    document.querySelector('#increment').click()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('undo')
    })

    document.querySelector('#undo').click()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('undo-removed')
    })
})
