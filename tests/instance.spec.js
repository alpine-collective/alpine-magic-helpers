import { Config } from '../src/instance'

beforeAll(() => {
    window.Config = Config
})

test('instance has breakpoints on config', async () => {
    const Config = {
        breakpoints: {},
    }
    expect(window.Config).toMatchObject(Config)
})
