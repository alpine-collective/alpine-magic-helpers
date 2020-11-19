import Alpine from 'alpinejs'
import config from '../src/config'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(function () {
    Alpine.addMagicProperty('testconfig', () => {
        return JSON.stringify(config.get('breakpoints'))
    })
})

test('config object is available', async () => {
    document.body.innerHTML = `
        <div x-data x-text="$testconfig"></div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('div').textContent).toEqual('{"xs":0,"sm":640,"md":768,"lg":1024,"xl":1280,"2xl":1536}')
    })
})

test('config object can be overriden', async () => {
    // Set new breakpoints (this goes in the head section in a real world aplication)
    window.AlpineMagicHelpersConfig = { breakpoints: { ok: 100 } }

    // Simulate page being ready
    Object.defineProperty(document, 'readyState', {
        get() { return 'interactive' },
    })
    const evt = document.createEvent('Event')
    evt.initEvent('readystatechange', false, false)
    document.dispatchEvent(evt)

    document.body.innerHTML = `
        <div x-data x-text="$testconfig"></div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('div').textContent).toEqual('{"ok":100}')
    })
})
