import Alpine from 'alpinejs'
import AlpineIntervalMagicMethod from '../dist/interval'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(() => {
    jest.useFakeTimers("modern")
    AlpineIntervalMagicMethod.start()
})

afterEach(() => {
    jest.useRealTimers()
})

test('$interval > is called every x seconds', async () => {
    document.body.innerHTML = `
        <div x-data="{counter: '0'}" x-init="$interval(() => counter++, 1000)">
            <p x-text="counter"></p>
        </div>
    `

    Alpine.start()

    expect(document.querySelector('p').textContent).toEqual('0')

    jest.advanceTimersByTime(1200)

    expect(document.querySelector('p').textContent).toEqual('1')

    jest.advanceTimersByTime(3000)

    expect(document.querySelector('p').textContent).toEqual('4')
})

test('$interval > can be delayed', async () => {
    document.body.innerHTML = `
        <div x-data="{counter: '0'}" x-init="$interval(() => counter++, {timer: 1000, delay: 2000})">
            <p x-text="counter"></p>
        </div>
    `

    Alpine.start()

    expect(document.querySelector('p').textContent).toEqual('0')

    jest.advanceTimersByTime(2200)

    expect(document.querySelector('p').textContent).toEqual('0')

    jest.advanceTimersByTime(1200)

    expect(document.querySelector('p').textContent).toEqual('1')

    jest.advanceTimersByTime(3200)

    expect(document.querySelector('p').textContent).toEqual('4')
})

test('$interval > can be paused', async () => {
    document.body.innerHTML = `
        <div x-data="{counter: '0', autoIntervalTest: true}" x-init="$interval(() => counter++, 1000)">
            <p x-text="counter"></p>
            <button @click="autoIntervalTest = !autoIntervalTest"><button>
        </div>
    `

    Alpine.start()

    expect(document.querySelector('p').textContent).toEqual('0')

    document.querySelector('button').click()

    jest.advanceTimersByTime(1200)

    expect(document.querySelector('p').textContent).toEqual('0')

    document.querySelector('button').click()

    jest.advanceTimersByTime(1200)

    expect(document.querySelector('p').textContent).toEqual('1')
})

test('$interval > timeout is cleared correctly when paused', async () => {
    document.body.innerHTML = `
        <div x-data="{counter: '0', autoIntervalTest: true}" x-init="$interval(() => counter++, 1000)">
            <p x-text="counter"></p>
            <button @click="autoIntervalTest = !autoIntervalTest"><button>
        </div>
    `

    Alpine.start()

    expect(document.querySelector('p').textContent).toEqual('0')

    document.querySelector('button').click()
    document.querySelector('button').click()

    jest.advanceTimersByTime(1200)

    expect(document.querySelector('p').textContent).toEqual('1')
})
