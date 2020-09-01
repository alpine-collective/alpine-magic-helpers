import Alpine from 'alpinejs'
import AlpineTruncateMagicMethod from '../dist/truncate.umd'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(() => {
    AlpineTruncateMagicMethod.start()
})

test('$truncate > can shorten text by character count', () => {
    document.body.innerHTML = `
        <div x-data="{ characters: 5, string: 'Lorem ipsum'}">
            <p x-text="$truncate(string, characters)"></p>
        </div>
    `

    Alpine.start()

    expect(document.querySelector('p').innerText).toEqual('Lorem…')
})

test('$truncate > can shorten text by word count', () => {
    document.body.innerHTML = `
        <div x-data="{ words: 5, string: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'}">
            <p x-text="$truncate(string, { words: words })"></p>
        </div>
    `

    Alpine.start()

    expect(document.querySelector('p').innerText).toEqual('Lorem ipsum dolor sit amet,…')
})

test('$truncate > can shorten text with custom suffix', () => {
    document.body.innerHTML = `
        <div x-data="{ characters: 5, string: 'Lorem ipsum'}">
            <p x-text="$truncate(string, characters, ' (read more)')"></p>
        </div>
    `

    Alpine.start()

    expect(document.querySelector('p').innerText).toEqual('Lorem (read more)')
})

test('$truncate > will react to changes in arguments', async () => {
    document.body.innerHTML = `
        <div x-data="{ characters: 5, string: 'Lorem ipsum'}">
            <p x-text="$truncate(string, characters)"></p>
            <button @click="characters = 2"></button>
        </div>
    `

    Alpine.start()

    expect(document.querySelector('p').innerText).toEqual('Lorem…')

    document.querySelector('button').click()

    await waitFor(() => {
        expect(document.querySelector('p').innerText).toEqual('Lo…')
    })
})
