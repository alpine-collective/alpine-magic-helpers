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

test('$parent > component can access parent scope when called only in a child event', async () => {
    document.body.innerHTML = `
        <div id="parent-component" x-data="{foo: 'bar'}">
            <div x-data>
                <button @click="$parent.foo = 'baz'"></button>
            </div>
        </div>
    `
    await waitFor(() => {
        expect(document.querySelector('#parent-component').__x.$data.foo === 'bar')
    })

    Alpine.start()

    document.querySelectorAll('button')[0].click()

    await waitFor(() => {
        expect(document.querySelector('#parent-component').__x.$data.foo === 'baz')
    })
})

test('$parent > component can update and watch deep object properties', async () => {
    document.body.innerHTML = `
        <div x-data="{foo: {bar: 'baz'}}">
            <div x-data>
                <p x-text="$parent.foo.bar"></p>
                <button @click="$parent.foo.bar = 'qux'"></button>
            </div>
            <button @click="foo.bar = 'bob'"></button>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('baz')
    })

    document.querySelectorAll('button')[0].click()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('qux')
    })

    document.querySelectorAll('button')[1].click()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('bob')
    })
})

// This test was added to remove `characterData: true` from the MutationObserver options
test('$parent > will not error on characterData edits', async () => {
    document.body.innerHTML = `
    <div x-data="{foo: 'bar'}">
        <div x-data>
            <p x-text="$parent.foo"></p>
            <span>Some text</span>
        </div>
    </div>
    `
    Alpine.start()
    document.querySelector('span').firstChild.appendData('Different text')
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

test('$component > component can update and watch deep object properties', async () => {
    document.body.innerHTML = `
        <div x-data>
            <p x-text="$component('ext').foo.bar"></p>
            <button @click="$component('ext').foo.bar = 'qux'"></button>
        </div>
        <div x-id="ext" x-data="{foo: {bar: 'baz'}}">
            <button @click="foo.bar = 'bob'"></button>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('baz')
    })

    document.querySelectorAll('button')[0].click()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('qux')
    })

    document.querySelectorAll('button')[1].click()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('bob')
    })
})

test('$component > this context is set correctly when functions are invoked through the helper', async () => {
    document.body.innerHTML = `
        <div x-data>
            <p x-text="$component('ext').foo"></p>
            <button @click="$component('ext').baz()"></button>
        </div>
        <div x-id="ext" x-data="{foo: 'bar', baz() {return this.foo = this.$refs.bob.textContent}}">
            <span x-ref="bob">qux</span>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('bar')
    })

    document.querySelector('button').click()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('qux')
    })
})

test('$parent > component can access granparent scope', async () => {
    document.body.innerHTML = `
        <div x-data="{foo: 'bar', getFoo() {return this.foo}}">
            <p x-text="foo"></p>
            <div x-data>
                <div x-data>
                    <p x-text="$parent.$parent.foo"></p>
                    <p x-text="$parent.$parent.getFoo()"></p>
                    <button @click="$parent.$parent.foo = 'baz'"></button>
                </div>
                <button @click="$parent.foo = 'bob'"></button>
            </div>
            <button @click="foo = 'qux'"></button>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelectorAll('p')[0].textContent).toEqual('bar')
        expect(document.querySelectorAll('p')[1].textContent).toEqual('bar')
        expect(document.querySelectorAll('p')[2].textContent).toEqual('bar')
    })

    document.querySelectorAll('button')[0].click()

    await waitFor(() => {
        expect(document.querySelectorAll('p')[0].textContent).toEqual('baz')
        expect(document.querySelectorAll('p')[1].textContent).toEqual('baz')
        expect(document.querySelectorAll('p')[2].textContent).toEqual('baz')
    })

    document.querySelectorAll('button')[1].click()

    await waitFor(() => {
        expect(document.querySelectorAll('p')[0].textContent).toEqual('bob')
        expect(document.querySelectorAll('p')[1].textContent).toEqual('bob')
        expect(document.querySelectorAll('p')[2].textContent).toEqual('bob')
    })

    document.querySelectorAll('button')[2].click()

    await waitFor(() => {
        expect(document.querySelectorAll('p')[0].textContent).toEqual('qux')
        expect(document.querySelectorAll('p')[1].textContent).toEqual('qux')
        expect(document.querySelectorAll('p')[2].textContent).toEqual('qux')
    })
})

test('$component > component can access magic properties', async () => {
    document.body.innerHTML = `
        <div x-data>
            <p x-text="$component('ext').$refs.bob.textContent"></p>
        </div>
        <div x-id="ext" x-data="{foo: 'bar'}">
            <span x-ref="bob" x-text="foo"></span>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('bar')
    })
})

test('$parent > x-for can loop correctly on a property from the parent scope', async () => {
    document.body.innerHTML = `
        <div x-data="{ comments: ['test', 'test2'] }">
            <div x-data>
                <template x-for="item in $parent.comments">
                  <p x-text="item"></p>
                </template>
            </div>
        </div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelectorAll('p').length).toEqual(2)
    })
})
