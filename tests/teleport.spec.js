import Alpine from 'alpinejs'
import AlpineTeleportMagicMethod from '../dist/teleport'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(() => {
    AlpineTeleportMagicMethod.start()
})

test('$teleport > can teleport elements to target destination on the DOM', async () => {
    document.body.innerHTML = `
        <span x-data x-init="() => $teleport($el,'#destination')">Teleporter</span>
        <div id="destination"></div>
    `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('#destination').firstChild.textContent).toEqual('Teleporter')
    })
})

test('$teleport > can teleport x-ref elements to target destination on the DOM', async () => {
    document.body.innerHTML = `
      <span x-data x-init="() => $teleport($refs.teleporter,'#destination')">
        <span x-ref="teleporter">Teleporter</span>
      </span>
      <div id="destination"></div>
  `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('#destination').firstChild.textContent).toEqual('Teleporter')
    })
})

test('$teleport > can teleport strings to target destination on the DOM', async () => {
    document.body.innerHTML = `
      <span x-data x-init="() => $teleport('Teleporter','#destination')"></span>
      <div id="destination"></div>
  `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('#destination').textContent).toEqual('Teleporter')
    })
})

test('$teleport > can can prepend elements', async () => {
    document.body.innerHTML = `
      <span x-data x-init="() => $teleport($refs.teleporter,'#destination',{prepend: true})">
        <span x-ref="teleporter">Teleporter</span>
      </span>
      <div id="destination"><span>First Child</span></div>
  `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('#destination').firstChild.textContent).toEqual('Teleporter')
    })
})

test('$teleport > carries events with the teleported element', async () => {
    document.body.innerHTML = `
      <span x-data="{text: ''}" x-init="() => $teleport($refs.teleporter, '#destination')">
        <button x-ref="teleporter" x-on:click="text = 'Content'">Teleporter</button>
        <p x-text="text"></p>
      </span>
      <div id="destination"></div>
  `

    Alpine.start()

    await waitFor(() => {
        expect(document.querySelector('#destination').firstChild.textContent).toEqual('Teleporter')
    })

    document.querySelector('button').click()

    await waitFor(() => {
        expect(document.querySelector('p').textContent).toEqual('Content')
    })
})
