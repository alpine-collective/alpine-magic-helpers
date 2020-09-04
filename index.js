import registerComponentMagicMethod from './src/component.js'
import registerFetchMagicMethod from './src/fetch.js'
import registerIntervalMagicMethod from './src/interval.js'
import registerTruncateMagicMethod from './src/truncate.js'
import AlpineScrollMagicMethod from './src/scroll.js'


const alpine = window.deferLoadingAlpine || ((alpine) => alpine())
window.deferLoadingAlpine = function (callback) {
    registerComponentMagicMethod()
    registerFetchMagicMethod()
    registerIntervalMagicMethod()
    registerTruncateMagicMethod()
    AlpineScrollMagicMethod.start()
    alpine(callback)
}

export default {
    registerComponentMagicMethod,
    registerFetchMagicMethod,
    registerIntervalMagicMethod,
    registerTruncateMagicMethod,
    AlpineScrollMagicMethod,
}
