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

// Untestable as jsdom does not implement/support RadioNodeLis
// https://github.com/jsdom/jsdom/issues/2600
test.skip('x-validate > required radio button', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input type="radio" name="test" value="one" x-validate="['required']">
                <input type="radio" name="test" value="two">
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

test('x-validate > required select dropdown', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <select name="test" x-validate="['required']">
                    <option></option>
                    <option value="value1">value1</option>
                    <option>value2</option>
                </select>
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Check form is invalid and cannot be submitted
    expect(document.querySelector('select').checkValidity()).toEqual(false)
    expect(document.querySelector('form').checkValidity()).toEqual(false)

    // Select option with value attribute
    fireEvent.input(document.querySelector('select'), {
        target: { value: document.querySelectorAll('option')[1].value },
    })

    // Form is now valid
    await waitFor(() => {
        expect(document.querySelector('select').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })

    // Select non-empty option without value attribute
    fireEvent.input(document.querySelector('select'), {
        target: { value: document.querySelectorAll('option')[2].value },
    })

    // Form is still valid
    await waitFor(() => {
        expect(document.querySelector('select').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })

    // Select empty option
    fireEvent.input(document.querySelector('select'), {
        target: { value: document.querySelectorAll('option')[0].value },
    })

    // Form is invalid
    await waitFor(() => {
        expect(document.querySelector('select').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })
})

test.todo('x-validate > required checkbox array')

test.todo('x-validate > required select multiple')

test('x-validate > email rule', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input name="test" x-validate="['email']">
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

    // Type more
    fireEvent.input(document.querySelector('input'), { target: { value: 'foo@bar.com' } })

    // Form is now valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('foo@bar.com')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })
})

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

    // Type 2 digits
    fireEvent.input(document.querySelector('input'), { target: { value: '11' } })

    // Form is not valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('11')
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })

    // Type 2 letters
    fireEvent.input(document.querySelector('input'), { target: { value: 'aa' } })

    // Form is now valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('aa')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })

    // Type 3 letters
    fireEvent.input(document.querySelector('input'), { target: { value: 'aaa' } })

    // Form is not valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('aaa')
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })
})

test('x-validate > equals rule', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input name="test" x-validate="['equals:bob']">
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
    fireEvent.input(document.querySelector('input'), { target: { value: 'baz' } })

    // Form is not valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('baz')
        expect(document.querySelector('input').checkValidity()).toEqual(false)
        expect(document.querySelector('form').checkValidity()).toEqual(false)
    })

    // Type more
    fireEvent.input(document.querySelector('input'), { target: { value: 'bob' } })

    // Form is now valid
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('bob')
        expect(document.querySelector('input').checkValidity()).toEqual(true)
        expect(document.querySelector('form').checkValidity()).toEqual(true)
    })
})

test.todo('x-validate > minoptions rules')
test.todo('x-validate > maxoptions rules')

test('x-validate > invalid helper', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input x-ref="test" name="test" x-validate="['required', 'minlength:2']">
                <span x-show="$invalid($refs.test)"></span>
                <span x-show="$invalid($refs.test, 'required')"></span>
                <span x-show="$invalid($refs.test, 'minlength:2')"></span>
                <input type="submit">
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Check errors won't show
    expect(document.querySelectorAll('span')[0].getAttribute('style')).toEqual('display: none;')
    expect(document.querySelectorAll('span')[1].getAttribute('style')).toEqual('display: none;')
    expect(document.querySelectorAll('span')[2].getAttribute('style')).toEqual('display: none;')

    document.querySelector('input').focus()
    // Type something
    fireEvent.input(document.querySelector('input'), { target: { value: 'foo' } })
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('foo')
    })
    // delete content
    fireEvent.input(document.querySelector('input'), { target: { value: '' } })

    // Errors still not showing
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('')
        expect(document.querySelectorAll('span')[0].getAttribute('style')).toEqual('display: none;')
        expect(document.querySelectorAll('span')[1].getAttribute('style')).toEqual('display: none;')
        expect(document.querySelectorAll('span')[2].getAttribute('style')).toEqual('display: none;')
    })

    // Trigger blur
    document.querySelector('input').blur()

    // Errors showing
    await waitFor(() => {
        expect(document.querySelectorAll('span')[0].getAttribute('style')).toEqual(null)
        expect(document.querySelectorAll('span')[1].getAttribute('style')).toEqual(null)
        expect(document.querySelectorAll('span')[2].getAttribute('style')).toEqual('display: none;')
    })

    fireEvent.input(document.querySelector('input'), { target: { value: 'a' } })
    // Errors showing
    await waitFor(() => {
        expect(document.querySelectorAll('span')[0].getAttribute('style')).toEqual(null)
        expect(document.querySelectorAll('span')[1].getAttribute('style')).toEqual('display: none;')
        expect(document.querySelectorAll('span')[2].getAttribute('style')).toEqual(null)
    })

    fireEvent.input(document.querySelector('input'), { target: { value: 'aa' } })
    // Errors not showing
    await waitFor(() => {
        expect(document.querySelectorAll('span')[0].getAttribute('style')).toEqual('display: none;')
        expect(document.querySelectorAll('span')[1].getAttribute('style')).toEqual('display: none;')
        expect(document.querySelectorAll('span')[2].getAttribute('style')).toEqual('display: none;')
    })
})

test('x-validate > immediate modifier', async () => {
    document.body.innerHTML = `
        <div x-data="{ foo: 'bar' }">
            <p x-text="foo"></p>
            <form>
                <input x-ref="test" name="test" x-validate.immediate="['required', 'minlength:2']">
                <span x-show="$invalid($refs.test)"></span>
                <input type="submit">
            </form>
        </div>
    `

    Alpine.start()

    // Make sure Alpine started
    await waitFor(() => {
        expect(document.querySelector('p').innerHTML).toEqual('bar')
    })

    // Check error won't show
    expect(document.querySelector('span').getAttribute('style')).toEqual('display: none;')

    document.querySelector('input').focus()
    // Type something
    fireEvent.input(document.querySelector('input'), { target: { value: 'foo' } })
    await waitFor(() => {
        expect(document.querySelector('input').value).toEqual('foo')
    })
    // delete content
    fireEvent.input(document.querySelector('input'), { target: { value: '' } })

    // Errors showing without blur
    await waitFor(() => {
        expect(document.querySelector('span').getAttribute('style')).toEqual(null)
    })
})

test.todo('x-validate > validation on form submit')
test.todo('x-validate > always immediate validation for checkboxes, radio buttons and select dropdowns')
