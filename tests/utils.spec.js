import Alpine from 'alpinejs'
import {
    checkForAlpine,
    syncWithObservedComponent,
    updateOnMutation,
    objectSetDeep,
    componentData,
    getNoopProxy,
} from '../src/utils'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

test('checkForAlpine > throws error when Alpine version is below 2.5', async () => {
    window.Alpine.version = '2.4.9'
    await waitFor(() => {
        expect(checkForAlpine).toThrow('')
    })
})

test('syncWithObservedComponent > can interact with another component', async () => {
    document.body.innerHTML = `
        <div x-data="{foo: 'bar'}">
            <p x-text="foo"></p>
        </div>
    `
    Alpine.start()

    const sync = syncWithObservedComponent({}, document.querySelector('[x-data]'), (syncedComponent, path, value) => {
        syncedComponent[path] = value
    })
    sync.foo = 'baz'

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('baz')
    })
})

test('updateOnMutation > can react to other component chanegs', async () => {
    document.body.innerHTML = `
        <div x-data="{foo: 'bar'}">
            <button @click="foo = 'baz'"></button>
        </div>
    `
    Alpine.start()
    console.log = jest.fn()

    updateOnMutation(document.querySelector('[x-data]'), () => {
        console.log('foo')
    })

    document.querySelectorAll('button')[0].click()

    await waitFor(() => {
        expect(console.log.mock.calls[0][0]).toBe('foo')
    })
})

test('objectSetDeep > can set a deep property on an object', () => {
    const object = { foo: { bar: 'baz' } }

    objectSetDeep(object, 'foo.bar', 'qux')

    expect(object.foo.bar).toBe('qux')
})

test('componentData > can extract data BEFORE Alpine is initialized', () => {
    document.body.innerHTML = `
        <div x-data="{foo: 'bar'}"></div>
    `

    const data = componentData(document.querySelector('[x-data]'))

    expect(data).toMatchObject({ foo: 'bar' })
})

test('componentData > can extract data AFTER Alpine is initialized', async () => {
    document.body.innerHTML = `
        <div x-data="{foo: 'bar'}"></div>
    `
    Alpine.start()

    const component = document.querySelector('[x-data]')

    await waitFor(() => {
        expect(component.__x.getUnobservedData()).toMatchObject({ foo: 'bar' })
        expect(componentData(component)).toMatchObject({ foo: 'bar' })
    })
})

test('componentData > can accept top level properties to scope to', async () => {
    document.body.innerHTML = `
        <div x-data="{foo: 'bar', baz: 'qux'}"></div>
    `
    Alpine.start()

    const component = document.querySelector('[x-data]')

    await waitFor(() => {
        expect(component.__x.getUnobservedData()).toMatchObject({ foo: 'bar', baz: 'qux' })
        expect(componentData(component, 'foo')).toMatchObject({ foo: 'bar' })
    })
})

test('getNoopProxy > return an empty string when accessing a property', async () => {
    document.body.innerHTML = `
        <p>bob</p>
    `
    expect(document.querySelector('p').textContent).toBe('bob')

    const proxy = getNoopProxy()
    document.querySelector('p').textContent = proxy.foo

    expect(document.querySelector('p').textContent).toBe('')
})

test('getNoopProxy > return an empty string when accessing a nested property', async () => {
    document.body.innerHTML = `
        <p>bob</p>
    `
    expect(document.querySelector('p').textContent).toBe('bob')

    const proxy = getNoopProxy()
    document.querySelector('p').textContent = proxy.foo.bar.baz

    expect(document.querySelector('p').textContent).toBe('')
})

test('getNoopProxy > return an empty string when accessing a function', async () => {
    document.body.innerHTML = `
        <p>bob</p>
    `
    expect(document.querySelector('p').textContent).toBe('bob')

    const proxy = getNoopProxy()
    document.querySelector('p').textContent = proxy.foo()

    expect(document.querySelector('p').textContent).toBe('')
})

test('getNoopProxy > return an empty string when accessing a nested function', async () => {
    document.body.innerHTML = `
        <p>bob</p>
    `
    expect(document.querySelector('p').textContent).toBe('bob')

    const proxy = getNoopProxy()
    document.querySelector('p').textContent = proxy.foo.bar()

    expect(document.querySelector('p').textContent).toBe('')
})
