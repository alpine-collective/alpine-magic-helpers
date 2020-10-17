import Alpine from 'alpinejs'
import AlpineUndoMagicMethod from '../dist/undo'
import { waitFor } from '@testing-library/dom'

beforeAll(() => {
    window.Alpine = Alpine
})

beforeEach(() => {
    AlpineUndoMagicMethod.start()
})

// test('$track > component can track updates', async () => {
//     document.body.innerHTML = `
//         <div x-data="{ number: 0 }" x-init="$track()">
//             <button
//                 @click="number = number + 1"
//                 x-text="number"></button>
//         </div>
//     `

//     Alpine.start()

//     await waitFor(() => {
//         expect(document.querySelector('div').__x.$data.$history.length).toEqual(0)
//     })

//     document.querySelectorAll('button')[0].click()

//     await waitFor(() => {
//         expect(document.querySelector('div').__x.$data.$history.length).toEqual(1)
//     })

//     document.querySelectorAll('button')[0].click()

//     await waitFor(() => {
//         expect(document.querySelector('div').__x.$data.$history.length).toEqual(2)
//     })
// })

// test('$track > component can render x-show when changes are available', async () => {
//     document.body.innerHTML = `
//         <div x-data="{ number: 0 }" x-init="$track()">
//             <button
//                 @click="number = number + 1"
//                 x-text="number"></button>
//             <p x-text="$history.length ? 'undo' : ''"></p>
//         </div>
//     `

//     Alpine.start()

//     await waitFor(() => {
//         expect(document.querySelector('div').__x.$data.$history.length).toEqual(0)
//     })

//     document.querySelectorAll('button')[0].click()

//     await waitFor(() => {
//         expect(document.querySelector('p').textContent).toEqual('undo')
//     })
// })

// test('$undo > component can render x-show when changes are removed', async () => {
//     document.body.innerHTML = `
//         <div x-data="{ number: 0 }" x-init="$track()">
//             <button
//                 id="increment"
//                 @click="number = number + 1"
//                 x-text="number"></button>
//             <button
//                 id="undo"
//                 @click="$undo()"></button>
//             <p x-text="$history.length ? 'undo' : 'undo-removed'"></p>
//         </div>
//     `

//     Alpine.start()

//     await waitFor(() => {
//         expect(document.querySelector('div').__x.$data.$history.length).toEqual(0)
//     })

//     document.querySelector('#increment').click()

//     await waitFor(() => {
//         expect(document.querySelector('p').textContent).toEqual('undo')
//     })

//     document.querySelector('#undo').click()

//     await waitFor(() => {
//         expect(document.querySelector('p').textContent).toEqual('undo-removed')
//     })
// })

// test('$undo > component can track nested properties', async () => {
//     document.body.innerHTML = `
//         <div x-data="{ number: { nested: 0 } }" x-init="$track()">
//             <button
//                 id="increment"
//                 @click="number.nested = number.nested + 1"
//                 x-text="number.nested"></button>
//             <button
//                 id="undo"
//                 @click="$undo()"></button>
//         </div>
//     `

//     Alpine.start()

//     await waitFor(() => {
//         expect(document.querySelector('div').__x.$data.$history.length).toEqual(0)
//     })

//     document.querySelector('#increment').click()

//     await waitFor(() => {
//         expect(document.querySelector('#increment').textContent).toEqual('1')
//     })

//     document.querySelector('#undo').click()

//     await waitFor(() => {
//         expect(document.querySelector('#increment').textContent).toEqual('0')
//     })
// })

// test('$track > component can track updates on specific properties', async () => {
//     document.body.innerHTML = `
//         <div x-data="{ number: 0, another: 0 }" x-init="$track('number')">
//             <button
//                 id="increment"
//                 @click="number = number + 1; another = another + 1"
//                 x-text="number"></button>
//             <p x-text="another"></p>
//             <button
//                 id="undo"
//                 @click="$undo()"></button>
//         </div>
//     `

//     Alpine.start()

//     await waitFor(() => {
//         expect(document.querySelector('button').textContent).toEqual('0')
//         expect(document.querySelector('p').textContent).toEqual('0')
//     })

//     document.querySelector('#increment').click()

//     await waitFor(() => {
//         expect(document.querySelector('button').textContent).toEqual('1')
//         expect(document.querySelector('p').textContent).toEqual('1')
//     })

//     document.querySelector('#undo').click()

//     await waitFor(() => {
//         expect(document.querySelector('button').textContent).toEqual('0')
//         expect(document.querySelector('p').textContent).toEqual('1')
//     })
// })

test('$undo > component can keep track after component is cloned', async () => {
    document.body.innerHTML = `
        <h1
            x-data="{ number: 0 }"
            x-init="$track()"
            @click="number = number + 1"
            x-text="number"></h1>
        <div id="insert-component-here"></div>
    `

    Alpine.start()

    document.querySelector('h1').click()

    await waitFor(() => {
        expect(document.querySelector('h1').textContent).toEqual('1')
    })

    document.querySelector('#insert-component-here').innerHTML = `
        <h2
            x-data="{ number: 0 }"
            x-init="$track()"
            @click="$undo()">
            <span x-text="number"></span>
        </h2>
    `

    Alpine.clone(document.querySelector('h1').__x, document.querySelector('h2'))

    await waitFor(() => {
        expect(document.querySelector('h2').__x.$data.$history.length).toEqual(1)
        expect(document.querySelector('span').textContent).toEqual('1')
    })

    document.querySelector('h2').click()

    await waitFor(() => {
        expect(document.querySelector('h2').__x.$data.$history.length).toEqual(0)
        expect(document.querySelector('span').textContent).toEqual('0')
    })
})
