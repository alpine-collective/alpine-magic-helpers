import registerComponentMagicMethod from './src/component.js'
import registerFetchMagicMethod from './src/fetch.js'
import registerIntervalMagicMethod from './src/interval.js'
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
