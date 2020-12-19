import Alpine from 'alpinejs'
import AlpineIntervalMagicMethod from '../dist/interval'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(() => {
    jest.useFakeTimers()
    AlpineIntervalMagicMethod.start()
})

test('$interval > is called every x seconds', async () => {
    document.body.innerHTML = `
        <div x-data="{counter: '0'}" x-init="$interval(() => counter++, 1000)">
            <p x-text="counter"></p>
        </div>
    `

    Alpine.start()

    expect(document.querySelector('p').textContent).toEqual('0')

    jest.advanceTimersByTime(1000)

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('1')
    }, { timeout: 200 })

    jest.advanceTimersByTime(3000)

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('4')
    }, { timeout: 200 })
})

test('$interval > can be delayed', async () => {
    document.body.innerHTML = `
        <div x-data="{counter: '0'}" x-init="$interval(() => counter++, {timer: 1000, delay: 2000})">
            <p x-text="counter"></p>
        </div>
    `

    Alpine.start()

    expect(document.querySelector('p').textContent).toEqual('0')

    jest.advanceTimersByTime(2000)

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('0')
    }, { timeout: 100 })

    jest.advanceTimersByTime(1000)

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('1')
    }, { timeout: 100 })

    jest.advanceTimersByTime(3000)

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('4')
    }, { timeout: 100 })
})
