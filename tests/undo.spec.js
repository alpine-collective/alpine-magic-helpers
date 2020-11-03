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
        expect(document.querySelector('div').__x.$data.$history.length).toEqual(0)
    })

    document.querySelectorAll('button')[0].click()

    await waitFor(() => {
        expect(document.querySelector('div').__x.$data.$history.length).toEqual(1)
    })

    document.querySelectorAll('button')[0].click()

    await waitFor(() => {
        expect(document.querySelector('div').__x.$data.$history.length).toEqual(2)
    })
})

test('$track > component can render x-show when changes are available', async () => {
    document.body.innerHTML = `
        <div x-data="{ number: 0 }" x-init="$track()">
            <button
                @click="number = number + 1"
                x-text="number"></button>
            <p x-text="$history.length ? 'undo' : ''"></p>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('div').__x.$data.$history.length).toEqual(0)
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
            <p x-text="$history.length ? 'undo' : 'undo-removed'"></p>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('div').__x.$data.$history.length).toEqual(0)
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

test('$undo > component can track nested properties', async () => {
    document.body.innerHTML = `
        <div x-data="{ number: { nested: 0 } }" x-init="$track()">
            <button
                id="increment"
                @click="number.nested = number.nested + 1"
                x-text="number.nested"></button>
            <button
                id="undo"
                @click="$undo()"></button>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('div').__x.$data.$history.length).toEqual(0)
    })

    document.querySelector('#increment').click()

    await waitFor(() => {
        expect(document.querySelector('#increment').textContent).toEqual('1')
    })

    document.querySelector('#undo').click()

    await waitFor(() => {
        expect(document.querySelector('#increment').textContent).toEqual('0')
    })
})

test('$track > component can track updates on specific properties', async () => {
    document.body.innerHTML = `
        <div x-data="{ number: 0, another: 0 }" x-init="$track('number')">
            <button
                id="increment"
                @click="number = number + 1; another = another + 1"
                x-text="number"></button>
            <p x-text="another"></p>
            <button
                id="undo"
                @click="$undo()"></button>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('button').textContent).toEqual('0')
        expect(document.querySelector('p').textContent).toEqual('0')
    })

    document.querySelector('#increment').click()

    await waitFor(() => {
        expect(document.querySelector('button').textContent).toEqual('1')
        expect(document.querySelector('p').textContent).toEqual('1')
    })

    document.querySelector('#undo').click()

    await waitFor(() => {
        expect(document.querySelector('button').textContent).toEqual('0')
        expect(document.querySelector('p').textContent).toEqual('1')
    })
})
test('$undo > component can keep track after component is replaced with a clone', async () => {
    document.body.innerHTML = `
        <div id="original" x-data="{ number: 0 }" x-init="$track()">
            <button
                class="increment"
                @click="number = number + 1"
                x-text="number"></button>
            <button
                class="undo"
                @click="$undo()"></button>
        </div>
        <div id="insert-component-here"></div>
    `

    Alpine.start()

    document.querySelector('#original .increment').click()

    await waitFor(() => {
        expect(document.querySelector('#original').__x.$data.$history.length).toEqual(1)
    })

    document.querySelector('#insert-component-here').innerHTML = `
        <div id="clone" x-data="{ number: 0 }" x-init="$track()">
            <button
                class="increment"
                @click="number = number + 1"
                x-text="number"></button>
            <span
                class="undo"
                @click="$undo()"></span>
        </div>
    `

    Alpine.clone(document.querySelector('#original').__x, document.querySelector('#clone'))
    document.querySelector('#original').remove()

    await waitFor(() => {
        expect(document.querySelector('#clone').__x.$data.$history.length).toEqual(1)
        expect(document.querySelector('#clone .increment').textContent).toEqual('1')
    })

    document.querySelector('#clone .undo').click()

    await waitFor(() => {
        expect(document.querySelector('#clone .increment').textContent).toEqual('0')
        expect(document.querySelector('#clone').__x.$data.$history.length).toEqual(0)
    })

    await waitFor(() => {
        expect(document.querySelector('#clone .increment').textContent).toEqual('0')
        expect(document.querySelector('#clone').__x.$data.$history.length).toEqual(0)
    })
})
