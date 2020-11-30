import Alpine from 'alpinejs'
import AlpineScrollMagicMethod from '../dist/scroll'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(() => {
    AlpineScrollMagicMethod.start()
    global.pageYOffset = 100
    global.scroll = jest.fn()
})

test('$scroll > can scroll using alpine references', async () => {
    document.body.innerHTML = `
        <div x-data>
            <button @click="$scroll($refs.foo)"></button>
            <p x-ref="foo" x-text="'loaded'"></p>
        </div>
    `

    // We need to mock getBoundingClientRect since jest doesn't have a viewport
    document.querySelector('p').getBoundingClientRect = jest.fn(() => ({
        top: 10,
    }))

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('loaded')
    })

    document.querySelector('button').click()

    // Again, jest doesn't have a viewport so we can only check that the native
    // function is called correctly
    expect(window.scroll).toHaveBeenCalledWith({ behavior: 'smooth', top: 110 })
})

test('$scroll > can scroll using CSS selectors', async () => {
    document.body.innerHTML = `
        <div x-data>
            <button @click="$scroll('#foo')"></button>
            <p id="foo" x-text="'loaded'"></p>
        </div>
    `

    // We need to mock getBoundingClientRect since jest doesn't have a viewport
    document.querySelector('p').getBoundingClientRect = jest.fn(() => ({
        top: 20,
    }))

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('loaded')
    })

    document.querySelector('button').click()

    // Again, jest doesn't have a viewport so we can only check that the native
    // function is called correctly
    expect(window.scroll).toHaveBeenCalledWith({ behavior: 'smooth', top: 120 })
})

test('$scroll > can scroll using Y coordinates', async () => {
    document.body.innerHTML = `
        <div x-data>
            <button @click="$scroll(0)"></button>
            <p id="foo" x-text="'loaded'"></p>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('loaded')
    })

    document.querySelector('button').click()

    // Again, jest doesn't have a viewport so we can only check that the native
    // function is called correctly
    expect(window.scroll).toHaveBeenCalledWith({ behavior: 'smooth', top: 0 })
})

test('$scroll > can apply an offset when scrolling', async () => {
    document.body.innerHTML = `
        <div x-data>
            <button @click="$scroll($refs.foo, {offset: 50})"></button>
            <p x-ref="foo" x-text="'loaded'"></p>
        </div>
    `

    // We need to mock getBoundingClientRect since jest doesn't have a viewport
    document.querySelector('p').getBoundingClientRect = jest.fn(() => ({
        top: 10,
    }))

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('loaded')
    })

    document.querySelector('button').click()

    // Again, jest doesn't have a viewport so we can only check that the native
    // function is called correctly
    expect(window.scroll).toHaveBeenCalledWith({ behavior: 'smooth', top: 60 })
})

test('$scroll > can disable the smooth scrolling', async () => {
    document.body.innerHTML = `
        <div x-data>
            <button @click="$scroll($refs.foo, {behavior: 'auto'})"></button>
            <p x-ref="foo" x-text="'loaded'"></p>
        </div>
    `

    // We need to mock getBoundingClientRect since jest doesn't have a viewport
    document.querySelector('p').getBoundingClientRect = jest.fn(() => ({
        top: 10,
    }))

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('loaded')
    })

    document.querySelector('button').click()

    // Again, jest doesn't have a viewport so we can only check that the native
    // function is called correctly
    expect(window.scroll).toHaveBeenCalledWith({ behavior: 'auto', top: 110 })
})

test('$scroll > can disable the smooth scrolling AND apply an offset', async () => {
    document.body.innerHTML = `
        <div x-data>
            <button @click="$scroll($refs.foo, {offset: 50, behavior: 'auto'})"></button>
            <p x-ref="foo" x-text="'loaded'"></p>
        </div>
    `

    // We need to mock getBoundingClientRect since jest doesn't have a viewport
    document.querySelector('p').getBoundingClientRect = jest.fn(() => ({
        top: 10,
    }))

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('loaded')
    })

    document.querySelector('button').click()

    // Again, jest doesn't have a viewport so we can only check that the native
    // function is called correctly
    expect(window.scroll).toHaveBeenCalledWith({ behavior: 'auto', top: 60 })
})

test('$scroll > can scroll when getBoundingClientRect returns a floating number', async () => {
    document.body.innerHTML = `
        <div x-data>
            <button @click="$scroll($refs.foo)"></button>
            <p x-ref="foo" x-text="'loaded'"></p>
        </div>
    `

    // We need to mock getBoundingClientRect since jest doesn't have a viewport
    document.querySelector('p').getBoundingClientRect = jest.fn(() => ({
        top: 20.756,
    }))

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('loaded')
    })

    document.querySelector('button').click()

    // Again, jest doesn't have a viewport so we can only check that the native
    // function is called correctly
    expect(window.scroll).toHaveBeenCalledWith({ behavior: 'smooth', top: 120 })
})
