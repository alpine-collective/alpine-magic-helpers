import Alpine from 'alpinejs'
import { waitFor } from '@testing-library/dom'
import config from '../src/config'

beforeAll(() => {
    window.Alpine = Alpine

    Object.defineProperty(document, 'readyState', {
        get() { return 'interactive' },
    })
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

test('config object keep the default value when overriding a different setting', async () => {
    // Set new breakpoints (this goes in the head section in a real world aplication)
    window.AlpineMagicHelpersConfig = { anotherprop: 'foo' }

    // Simulate page being ready
    const evt = document.createEvent('Event')
    evt.initEvent('readystatechange', false, false)
    document.dispatchEvent(evt)

    document.body.innerHTML = `
        <div x-data>
            <p x-text="$testconfig"></p>
            <p x-text="$testconfig2"></p>
        </div>
    `

    Alpine.addMagicProperty('testconfig2', () => {
        return JSON.stringify(config.get('anotherprop'))
    })
    Alpine.start()

    await waitFor(() => {
        expect(document.querySelectorAll('p')[0].textContent).toEqual('{"xs":0,"sm":640,"md":768,"lg":1024,"xl":1280,"2xl":1536}')
        expect(document.querySelectorAll('p')[1].textContent).toEqual('"foo"')
    })
})

test('config object can be overriden', async () => {
    // Set new breakpoints (this goes in the head section in a real world aplication)
    window.AlpineMagicHelpersConfig = { breakpoints: { mobile: 100 } }

    // Simulate page being ready
    const evt = document.createEvent('Event')
    evt.initEvent('readystatechange', false, false)
    document.dispatchEvent(evt)

    document.body.innerHTML = `
        <div x-data x-text="$testconfig"></div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('div').textContent).toEqual('{"mobile":100}')
    })
})
