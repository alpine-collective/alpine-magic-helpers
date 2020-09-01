import Alpine from 'alpinejs'
import AlpineTruncateMagicMethod from '../dist/truncate.umd'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(() => {
    AlpineTruncateMagicMethod.start()
})

test('$truncate > can shorten text by character count', () => {
    document.body.innerHTML = `
        <div x-data="{ characters: 5, string: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}">
            <p x-text="$truncate(string, characters)"></p>
        </div>
    `

    Alpine.start()

    expect(document.querySelector('p').innerText).toEqual('Lorem…')
})

test('$truncate > can shorten text by word count', () => {
    document.body.innerHTML = `
        <div x-data="{ words: 5, string: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}">
            <p x-text="$truncate(string, { words: words })"></p>
        </div>
    `

    Alpine.start()

    expect(document.querySelector('p').innerText).toEqual('Lorem ipsum dolor sit amet,…')
})
