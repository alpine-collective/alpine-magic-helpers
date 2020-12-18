import Alpine from 'alpinejs'
import AlpineRangeMagicMethod from '../dist/range'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(() => {
    jest.useFakeTimers()
    AlpineRangeMagicMethod.start()
})

test('$range > can iterate over a simple range', async () => {
    document.body.innerHTML = `
        <div x-data>
            <template x-for="item in $range(1, 10)"><p></p></template>
        </div>
    `

    expect(Array.from(document.querySelectorAll('p')).length).toEqual(0)

    Alpine.start()

    await waitFor(() => {
        expect(Array.from(document.querySelectorAll('p')).length).toEqual(10)
    })
})

test('$range > can accept a single parameter', async () => {
    document.body.innerHTML = `
        <div x-data>
            <template x-for="item in $range(10)"><p x-text="item"></p></template>
        </div>
    `

    expect(Array.from(document.querySelectorAll('p')).length).toEqual(0)

    Alpine.start()

    await waitFor(() => {
        expect(Array.from(document.querySelectorAll('p')).length).toEqual(10)
        expect(Array.from(document.querySelectorAll('p'))[0].textContent).toEqual('1')
    })
})

test('$range > can accept range starting number', async () => {
    document.body.innerHTML = `
        <div x-data>
            <template x-for="(item, index) in $range(2, 10)"><p x-text="item"></p></template>
        </div>
    `

    expect(Array.from(document.querySelectorAll('p')).length).toEqual(0)

    Alpine.start()

    await waitFor(() => {
        expect(Array.from(document.querySelectorAll('p')).length).toEqual(9)
        expect(Array.from(document.querySelectorAll('p'))[0].textContent).toEqual('2')
    })
})

test('$range > can step over values', async () => {
    document.body.innerHTML = `
        <div x-data>
            <template x-for="(item, index) in $range(1, 10, 2)"><p x-text="item"></p></template>
        </div>
    `

    expect(Array.from(document.querySelectorAll('p')).length).toEqual(0)

    Alpine.start()

    await waitFor(() => {
        expect(Array.from(document.querySelectorAll('p')).length).toEqual(5)
        expect(Array.from(document.querySelectorAll('p'))[0].textContent).toEqual('1')
        expect(Array.from(document.querySelectorAll('p'))[1].textContent).toEqual('3')
    })
})

test('$range > can iterate in reverse if the first param is greater', async () => {
    document.body.innerHTML = `
        <div x-data>
            <template x-for="(item, index) in $range(20, 10)"><p x-text="item"></p></template>
        </div>
    `

    expect(Array.from(document.querySelectorAll('p')).length).toEqual(0)

    Alpine.start()

    await waitFor(() => {
        expect(Array.from(document.querySelectorAll('p')).length).toEqual(11)
        expect(Array.from(document.querySelectorAll('p'))[0].textContent).toEqual('20')
        expect(Array.from(document.querySelectorAll('p'))[1].textContent).toEqual('19')
    })
})

test('$range > can handle range to 0', async () => {
    document.body.innerHTML = `
        <div x-data>
            <template x-for="(item, index) in $range(10, 0)"><p x-text="item"></p></template>
        </div>
    `

    expect(Array.from(document.querySelectorAll('p')).length).toEqual(0)

    Alpine.start()

    await waitFor(() => {
        expect(Array.from(document.querySelectorAll('p')).length).toEqual(11)
        expect(Array.from(document.querySelectorAll('p'))[0].textContent).toEqual('10')
        expect(Array.from(document.querySelectorAll('p'))[1].textContent).toEqual('9')
    })
})

test('$range > can handle 0 as single parameter', async () => {
    document.body.innerHTML = `
        <div x-data>
            <template x-for="(item, index) in $range(0)"><p x-text="item"></p></template>
        </div>
    `

    expect(Array.from(document.querySelectorAll('p')).length).toEqual(0)

    Alpine.start()

    await waitFor(() => {
        expect(Array.from(document.querySelectorAll('p')).length).toEqual(1)
        expect(Array.from(document.querySelectorAll('p'))[0].textContent).toEqual('0')
    })
})
