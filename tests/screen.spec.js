import Alpine from 'alpinejs'
import AlpineScreenMagicMethod from '../dist/screen'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(() => {
    window.innerWidth = 1920
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

test('$screen > framework of breakpoints are definable', async () => {
    document.body.innerHTML = `
      <div x-data>
          <span x-show="$screen('widescreen','bl')"></span>
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
