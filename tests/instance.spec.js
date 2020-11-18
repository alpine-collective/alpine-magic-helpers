import { AlpineMagicHelpers } from '../src/instance'

beforeAll(() => {
    window.AlpineMagicHelpers = AlpineMagicHelpers
})

test('instance has breakpoints on config', async () => {
    const HelperObject = {
        Config: {
            breakpoints: {},
        },
    }
    expect(window.AlpineMagicHelpers).toMatchObject(HelperObject)
})
