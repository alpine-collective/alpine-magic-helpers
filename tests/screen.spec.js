import Alpine from 'alpinejs'
import AlpineScreenMagicMethod from '../dist/screen'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.ontouchstart = jest.fn()
    window.Alpine = Alpine
})

beforeEach(() => {
    window.innerWidth = 1366
    window.innerHeight = 758
    AlpineScreenMagicMethod.start()
})

test('$screen > breakpoints are updated on windows resize', async () => {
    document.body.innerHTML = `
      <div x-data>
          <span x-show="$screen('lg')"></span>
      </div>
  `

    Alpine.start()

    expect(document.querySelector('span').getAttribute('style')).toEqual(null)

    window.innerWidth = 500

    window.dispatchEvent(new Event('resize'))

    await waitFor(() => {
        expect(document.querySelector('span').getAttribute('style')).toEqual('display: none;')
    })
})

test('$screen > breakpoint could be provided as number', async () => {
    document.body.innerHTML = `
      <div x-data>
          <span x-show="$screen(1200)"></span>
      </div>
  `

    Alpine.start()

    expect(document.querySelector('span').getAttribute('style')).toEqual(null)

    window.innerWidth = 500

    window.dispatchEvent(new Event('resize'))

    await waitFor(() => {
        expect(document.querySelector('span').getAttribute('style')).toEqual('display: none;')
    })
})

test('$screen > can detect orientation', async () => {
    document.body.innerHTML = `
      <div x-data>
          <span x-show="$screen('landscape')"></span>
      </div>
  `

    Alpine.start()

    expect(document.querySelector('span').getAttribute('style')).toEqual(null)

    window.innerHeight = 2000

    window.dispatchEvent(new Event('resize'))

    await waitFor(() => {
        expect(document.querySelector('span').getAttribute('style')).toEqual('display: none;')
    })
})

test('$screen > can detect touch screens', async () => {
    document.body.innerHTML = `
      <div x-data>
          <p x-show="$screen('touch')"></p>
          <span x-show="!$screen('touch')"></span>
      </div>
  `

    Alpine.start()
    expect(document.querySelector('p').getAttribute('style')).toEqual(null)
    expect(document.querySelector('span').getAttribute('style')).toEqual('display: none;')
})
