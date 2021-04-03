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
                <input name="test" x-validate="['required']">
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Check form is invalid and cannot be submitted
    expect(document.querySelector('input').checkValidity()).toEqual(false)
    expect(document.querySelector('form').checkValidity()).toEqual(false)

    // Type something
    fireEvent.input(document.querySelector('input'), { target: { value: 'bob' } })

    // Form is now valid
    await waitFor(() => {
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })

    // Delete content
    fireEvent.input(document.querySelector('input'), { target: { value: '' } })

    // Form is invalid
    await waitFor(() => {
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })
})

test('x-validate > required textarea', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <textarea name="test" x-validate="['required']"></textarea>
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Form is now valid
    expect(document.querySelector('textarea').checkValidity()).toEqual(false)
    expect(document.querySelector('form').checkValidity()).toEqual(false)

    // Type something
    fireEvent.input(document.querySelector('textarea'), { target: { value: 'bob' } })

    // Check error message is still not visible
    await waitFor(() => {
        expect(document.querySelector('textarea').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })

    // Delete content
    fireEvent.input(document.querySelector('textarea'), { target: { value: '' } })

    // Form is invalid
    await waitFor(() => {
        expect(document.querySelector('textarea').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })
})

test('x-validate > required checkbox', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input type="checkbox" name="test" x-validate="['required']">
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Check form is invalid and cannot be submitted
    expect(document.querySelector('input').checkValidity()).toEqual(false)
    expect(document.querySelector('form').checkValidity()).toEqual(false)

    // Check
    document.querySelector('input').click()

    // Form is now valid
    await waitFor(() => {
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })

    // Uncheck
    document.querySelector('input').click()

    // Form is invalid
    await waitFor(() => {
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })
})

test.todo('x-validate > required radio button')

test.todo('x-validate > required select dropdown')

test('x-validate > minlength rule', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input name="test" x-validate="['minlength:2']">
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Check form is valid when field is empty
    expect(document.querySelector('input').checkValidity()).toEqual(true)
    expect(document.querySelector('form').checkValidity()).toEqual(true)

    // Type something
    fireEvent.input(document.querySelector('input'), { target: { value: 'f' } })

    // Form is not valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('f')
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })

    // Type more
    fireEvent.input(document.querySelector('input'), { target: { value: 'fo' } })

    // Form is now valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('fo')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })
})

test('x-validate > maxlength rule', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input name="test" x-validate="['maxlength:2']">
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Check form is valid when field is empty
    expect(document.querySelector('input').checkValidity()).toEqual(true)
    expect(document.querySelector('form').checkValidity()).toEqual(true)

    // Type something
    fireEvent.input(document.querySelector('input'), { target: { value: 'foo' } })

    // Form is not valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('foo')
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })

    // Type less
    fireEvent.input(document.querySelector('input'), { target: { value: 'fo' } })

    // Form is now valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('fo')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })
})

test('x-validate > numeric rule', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input name="test" x-validate="['numeric']">
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Check form is valid when field is empty
    expect(document.querySelector('input').checkValidity()).toEqual(true)
    expect(document.querySelector('form').checkValidity()).toEqual(true)

    // Type letters
    fireEvent.input(document.querySelector('input'), { target: { value: '1foo' } })

    // Form is not valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('1foo')
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })

    // Type a number
    fireEvent.input(document.querySelector('input'), { target: { value: '42' } })

    // Form is now valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('42')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })

    // Type a negative number
    fireEvent.input(document.querySelector('input'), { target: { value: '-42' } })

    // Form is still valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('-42')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })

    // Type decimal
    fireEvent.input(document.querySelector('input'), { target: { value: '42.42' } })

    // Form is still valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('42.42')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })
})

test('x-validate > integer rule', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input name="test" x-validate="['integer']">
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Check form is valid when field is empty
    expect(document.querySelector('input').checkValidity()).toEqual(true)
    expect(document.querySelector('form').checkValidity()).toEqual(true)

    // Type letters
    fireEvent.input(document.querySelector('input'), { target: { value: '1foo' } })

    // Form is not valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('1foo')
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })

    // Type an integer
    fireEvent.input(document.querySelector('input'), { target: { value: '42' } })

    // Form is now valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('42')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })

    // Type a negative integer
    fireEvent.input(document.querySelector('input'), { target: { value: '-42' } })

    // Form is still valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('-42')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })

    // Type decimal
    fireEvent.input(document.querySelector('input'), { target: { value: '42.42' } })

    // Form is not valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('42.42')
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })
})

test('x-validate > min rule', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input name="test" x-validate="['min:10']">
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Check form is valid when field is empty
    expect(document.querySelector('input').checkValidity()).toEqual(true)
    expect(document.querySelector('form').checkValidity()).toEqual(true)

    // Type a number less than 10
    fireEvent.input(document.querySelector('input'), { target: { value: '9' } })

    // Form is not valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('9')
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })

    // Type 10
    fireEvent.input(document.querySelector('input'), { target: { value: '10' } })

    // Form is now valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('10')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })

    // Type a number greater than 10
    fireEvent.input(document.querySelector('input'), { target: { value: '11' } })

    // Form is still valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('11')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })
})

test('x-validate > max rule', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input name="test" x-validate="['max:10']">
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Check form is valid when field is empty
    expect(document.querySelector('input').checkValidity()).toEqual(true)
    expect(document.querySelector('form').checkValidity()).toEqual(true)

    // Type a number greater than 10
    fireEvent.input(document.querySelector('input'), { target: { value: '11' } })

    // Form is not valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('11')
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })

    // Type 10
    fireEvent.input(document.querySelector('input'), { target: { value: '10' } })

    // Form is now valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('10')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })

    // Type a number less than 10
    fireEvent.input(document.querySelector('input'), { target: { value: '9' } })

    // Form is still valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('9')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })
})

test('x-validate > pattern rule', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input name="test" x-validate="['pattern:^[a-z]{2}$']">
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Check form is valid when field is empty
    expect(document.querySelector('input').checkValidity()).toEqual(true)
    expect(document.querySelector('form').checkValidity()).toEqual(true)

    // Type a number greater than 10
    fireEvent.input(document.querySelector('input'), { target: { value: '11' } })

    // Form is not valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('11')
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })

    // Type 10
    fireEvent.input(document.querySelector('input'), { target: { value: 'aa' } })

    // Form is now valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('aa')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })

    // Type a number less than 10
    fireEvent.input(document.querySelector('input'), { target: { value: 'aaa' } })

    // Form is not valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('aaa')
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })
})

test.todo('x-validate > match rule')

test.todo('x-validate > lowercase rule')

test.todo('x-validate > uppercase rule')

test.todo('x-validate > digit rule')

test.todo('x-validate > symbol rule')

test.todo('x-validate > email rule')

test.todo('x-validate > invalid helper')

test.todo('x-validate > immediate modifier')
