import Alpine from 'alpinejs'
import AlpineTeleportMagicMethod from '../dist/teleport'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(() => {
    AlpineTeleportMagicMethod.start()
})

test('$teleport > by default teleports element to body', async () => {
    document.body.innerHTML = `
        <span x-data x-init="() => $teleport()">foo</span>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('body > span').textContent).toEqual('foo')
    })
})

test('$teleport > can teleport node elements to target destination', async () => {
    document.body.innerHTML = `
      <span x-data x-init="() => $teleport($refs.teleporter,'#destination')">
        <span x-ref="teleporter">foo</span>
      </span>
      <div id="destination"></div>
  `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('#destination').firstChild.textContent).toEqual('foo')
    })
})

test('$teleport > converts a template string into HTML DOM node and teleports it to destination', async () => {
    document.body.innerHTML = `
      <span x-data x-init="() => $teleport('<span>foo<span>','#destination')"></span>
      <div id="destination"></div>
  `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('#destination span').textContent).toEqual('foo')
    })
})

test('$teleport > can can prepend elements', async () => {
    document.body.innerHTML = `
      <span x-data x-init="() => $teleport($refs.teleporter,'#destination',{prepend: true})">
        <span x-ref="teleporter">foo</span>
      </span>
      <div id="destination"><span>First Child</span></div>
  `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('#destination').firstChild.textContent).toEqual('foo')
    })
})

test('$teleport > carries reactivity with the teleported element even it is not a component', async () => {
    document.body.innerHTML = `
      <span x-data="{foo: 'bar'}" x-init="() => $teleport($refs.teleporter, '#destination')">
        <button x-ref="teleporter" x-on:click="foo='baz'" x-text="foo"></button>
        <p x-text="foo"></p>
      </span>
      <div id="destination"></div>
  `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('button').textContent).toEqual('bar')
        expect(document.querySelector('p').textContent).toEqual('bar')
    })

    document.querySelector('button').click()

    await waitFor(() => {
        expect(document.querySelector('button').textContent).toEqual('baz')
        expect(document.querySelector('p').textContent).toEqual('baz')
    })
})
