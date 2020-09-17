import Alpine from 'alpinejs'
import AlpineFetchMagicMethod from '../dist/fetch'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(function () {
    AlpineFetchMagicMethod.start()
})

test('$fetch > accept strings', async () => {
    let xhrMock = {
        open: jest.fn(),
        send: jest.fn(),
        readyState: 4,
        responseText: JSON.stringify({"title": "bar"}),
        status: 200
    }

    window.XMLHttpRequest = jest.fn(() => xhrMock)

    document.body.innerHTML = `
        <div x-data="{title: 'foo'}" x-init="$fetch('https://dummy.url').then(response => title = response.title)">
            <p x-text="title"></p>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('foo')
    })

    xhrMock.onreadystatechange()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('bar')
    })

    expect(xhrMock.open).toHaveBeenCalledWith('GET', 'https://dummy.url', expect.anything())
})

test('$fetch > accept objects', async () => {
    let xhrMock = {
        open: jest.fn(),
        send: jest.fn(),
        readyState: 4,
        responseText: JSON.stringify({"title": "bar"}),
        status: 200
    }

    window.XMLHttpRequest = jest.fn(() => xhrMock)

    document.body.innerHTML = `
        <div x-data="{ title: 'foo'}" x-init="$fetch({url: 'https://dummy.url', method: 'post'}).then(response => title = response.data.title)">
            <p x-text="title"></p>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('foo')
    })

    xhrMock.onreadystatechange()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('bar')
    })

    expect(xhrMock.open).toHaveBeenCalledWith('POST', 'https://dummy.url', expect.anything())
})
