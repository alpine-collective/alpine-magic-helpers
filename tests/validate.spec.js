import Alpine from 'alpinejs'
import AlpineValidateCustomDirective from '../dist/validate'
import { waitFor, fireEvent } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(() => {
    AlpineValidateCustomDirective.start()
})

test('x-validate > required input', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input x-ref="baz" name="test" x-validate="['required']">
                <span x-show="$invalid($refs.baz)">Invalid</span>
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Error message is not visible
    expect(document.querySelector('span').getAttribute('style')).toEqual('display: none;')

    // Check form is invalid and cannot be submitted
    expect(document.querySelector('form').checkValidity()).toEqual(false)

    // Type something
    fireEvent.input(document.querySelector('input'), { target: { value: 'bob' } })

    // Check error message is still not visible
    await waitFor(() => {
        expect(document.querySelector('span').getAttribute('style')).toEqual('display: none;')
    })

    // Delete content
    fireEvent.input(document.querySelector('input'), { target: { value: '' } })

    // Check error message is visible
    await waitFor(() => {
        expect(document.querySelector('span').getAttribute('style')).toEqual(null)
    })
})

test.todo('x-validate > required textarea')

test.todo('x-validate > required checkbox')

test.todo('x-validate > required radio button')

test.todo('x-validate > required select dropdown')

test.todo('x-validate > minlength rule')

test.todo('x-validate > maxlength rule')

test.todo('x-validate > numeric rule')

test.todo('x-validate > integer rule')

test.todo('x-validate > min rule')

test.todo('x-validate > max rule')

test.todo('x-validate > pattern rule')

test.todo('x-validate > match rule')

test.todo('x-validate > lowercase rule')

test.todo('x-validate > uppercase rule')

test.todo('x-validate > digit rule')

test.todo('x-validate > symbol rule')

test.todo('x-validate > immediate modifier')
