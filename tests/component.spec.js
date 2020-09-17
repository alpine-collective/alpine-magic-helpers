import Alpine from 'alpinejs'
import AlpineComponentMagicMethod from '../dist/component'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(function () {
    AlpineComponentMagicMethod.start()
})

test('$parent > component can access parent scope', async () => {
    document.body.innerHTML = `
        <div x-data="{foo: 'bar'}">
            <div x-data>
                <p x-text="$parent.foo"></p>
                <button @click="$parent.foo = 'baz'"></button>
            </div>
            <button @click="foo = 'bob'"></button>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('bar')
    })

    document.querySelectorAll('button')[0].click()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('baz')
    })

    document.querySelectorAll('button')[1].click()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('bob')
    })
})

test('$component > component can access external scope', async () => {
    document.body.innerHTML = `
        <div x-data>
            <p x-text="$component('ext').foo"></p>
            <button @click="$component('ext').foo = 'baz'"></button>
        </div>
        <div x-id="ext" x-data="{foo: 'bar'}">
            <button @click="foo = 'bob'"></button>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('bar')
    })

    document.querySelectorAll('button')[0].click()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('baz')
    })

    document.querySelectorAll('button')[1].click()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('bob')
    })
})
