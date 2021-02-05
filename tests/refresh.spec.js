import Alpine from 'alpinejs'
import AlpineRefreshMagicMethod from '../dist/refresh'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(() => {
    AlpineRefreshMagicMethod.start()
})

test('$refresh > component is refreshed when invoked', async () => {
    document.body.innerHTML = `
        <div x-data>
            <span x-text="window.refreshFixture"></span>
            <button @click="$refresh()"></button>
        </div>
    `

    window.refreshFixture = 10

    Alpine.start()

    expect(document.querySelector('span').textContent).toEqual('10')

    window.refreshFixture = 20

    expect(document.querySelector('span').textContent).toEqual('10')

    document.querySelector('button').click()

    await waitFor(() => {
        expect(document.querySelector('span').textContent).toEqual('20')
    })
})

test('$refresh > can refresh another component', async () => {
    document.body.innerHTML = `
        <div x-data>
            <button @click="$refresh(document.querySelector('span').__x.$el)"></button>
        </div>
        <span x-data x-text="window.refreshFixture"></span>
    `

    window.refreshFixture = 10

    Alpine.start()

    expect(document.querySelector('span').textContent).toEqual('10')

    window.refreshFixture = 20

    expect(document.querySelector('span').textContent).toEqual('10')

    document.querySelector('button').click()

    await waitFor(() => {
        expect(document.querySelector('span').textContent).toEqual('20')
    })
})
