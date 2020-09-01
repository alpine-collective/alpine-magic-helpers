import AlpineComponentMagicMethod from './component'
import AlpineFetchMagicMethod from './fetch'
import AlpineIntervalMagicMethod from './interval'
import registerTruncateMagicMethod from './src/truncate.js'

const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function (callback) {
    registerComponentMagicMethod()
    registerFetchMagicMethod()
    registerIntervalMagicMethod()
    registerTruncateMagicMethod()
    alpine(callback)
}

export default {
    registerComponentMagicMethod,
    registerFetchMagicMethod,
    registerIntervalMagicMethod,
    registerTruncateMagicMethod,
}
